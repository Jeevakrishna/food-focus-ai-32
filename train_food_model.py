from datasets import load_dataset, Dataset
from transformers import AutoFeatureExtractor, AutoModelForImageClassification, TrainingArguments, Trainer
import torch
import torch.nn as nn
from torchvision.transforms import Compose, RandomResizedCrop, Normalize
from PIL import Image
import requests
from io import BytesIO
from sklearn.model_selection import train_test_split
import numpy as np
from huggingface_hub import login

# Login to Hugging Face
login('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')

print("Loading dataset...")
dataset = load_dataset("JeevakrishnaVetrivel/Foods_data")
print("Dataset loaded successfully!")

def download_image(url):
    try:
        response = requests.get(url, timeout=10)
        img = Image.open(BytesIO(response.content)).convert('RGB')
        return img
    except Exception as e:
        print(f"Failed to download image from {url}: {str(e)}")
        return None

print("Initializing feature extractor...")
feature_extractor = AutoFeatureExtractor.from_pretrained(
    "google/vit-base-patch16-224-in21k",
    use_fast=True
)

# Create global label mappings
all_names = list(set(dataset["train"]["name"]))
label2id = {label: i for i, label in enumerate(all_names)}
id2label = {i: label for label, i in label2id.items()}

def preprocess_images(examples):
    print(f"Processing batch of {len(examples['imgurl'])} examples...")
    
    # Download images from URLs
    images = []
    valid_indices = []
    labels = []
    nutritional_values = []
    
    for idx, (url, name, nutrition_str) in enumerate(zip(examples["imgurl"], examples["name"], examples["nutritions"])):
        img = download_image(url)
        if img is not None:
            images.append(img)
            labels.append(label2id[name])
            
            # Extract nutritional values
            nutrition_dict = eval(nutrition_str)
            nutritional_values.append([
                float(nutrition_dict.get('Calories', '0 kcal').split()[0]),
                float(nutrition_dict.get('Protein', '0 g').split()[0]),
                float(nutrition_dict.get('Fat', '0 g').split()[0]),
                float(nutrition_dict.get('Carbohydrates', '0 g').split()[0]),
                float(nutrition_dict.get('Fiber', '0 g').split()[0])
            ])
            valid_indices.append(idx)
    
    if not images:
        return {}
    
    # Process images using feature extractor
    inputs = feature_extractor(images=images, return_tensors="pt")
    
    return {
        "pixel_values": inputs.pixel_values,
        "labels": labels,
        "nutritional_values": nutritional_values
    }

print("Preprocessing dataset...")
# Split dataset into train and validation
train_dataset = dataset["train"]
train_val_split = train_dataset.train_test_split(test_size=0.2, seed=42)

# Process train and validation sets
processed_train = train_val_split["train"].map(
    preprocess_images,
    batched=True,
    batch_size=16,
    remove_columns=train_dataset.column_names
)

processed_val = train_val_split["test"].map(
    preprocess_images,
    batched=True,
    batch_size=16,
    remove_columns=train_dataset.column_names
)

print(f"Number of unique food classes: {len(label2id)}")

class FoodClassificationModel(nn.Module):
    def __init__(self, num_labels):
        super().__init__()
        self.vit = AutoModelForImageClassification.from_pretrained(
            "google/vit-base-patch16-224-in21k",
            num_labels=num_labels,
            ignore_mismatched_sizes=True
        )
        # Additional layer for nutritional value prediction
        self.nutrition_head = nn.Sequential(
            nn.Linear(768, 256),
            nn.ReLU(),
            nn.Linear(256, 5)  # 5 nutritional values: calories, protein, fat, carbs, fiber
        )
        
    def forward(self, pixel_values, labels=None, nutritional_values=None):
        outputs = self.vit(pixel_values, labels=labels)
        
        # Get the hidden states from the last layer
        hidden_states = self.vit.vit.pooler(outputs.hidden_states[-1])
        
        # Predict nutritional values
        nutrition_pred = self.nutrition_head(hidden_states)
        
        if labels is not None and nutritional_values is not None:
            # Classification loss
            loss_cls = outputs.loss
            
            # Nutritional value prediction loss (MSE)
            loss_nutrition = nn.MSELoss()(nutrition_pred, nutritional_values)
            
            # Combined loss
            total_loss = loss_cls + 0.5 * loss_nutrition
            
            return {"loss": total_loss, "logits": outputs.logits, "nutrition_pred": nutrition_pred}
        
        return {"logits": outputs.logits, "nutrition_pred": nutrition_pred}

print("Initializing model...")
model = FoodClassificationModel(num_labels=len(label2id))

print("Setting up training arguments...")
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=10,  # Increased epochs for better convergence
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=10,
    eval_steps=100,
    save_steps=100,
    evaluation_strategy="steps",
    save_strategy="steps",
    load_best_model_at_end=True,
    push_to_hub=True,
    learning_rate=2e-5,  # Adjusted learning rate
)

class NutritionTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False):
        outputs = model(
            pixel_values=inputs["pixel_values"],
            labels=inputs["labels"],
            nutritional_values=torch.tensor(inputs["nutritional_values"], dtype=torch.float32).to(inputs["pixel_values"].device)
        )
        
        loss = outputs["loss"] if isinstance(outputs, dict) else outputs[0]
        return (loss, outputs) if return_outputs else loss

print("Initializing trainer...")
trainer = NutritionTrainer(
    model=model,
    args=training_args,
    train_dataset=processed_train,
    eval_dataset=processed_val,
)

print("Starting training...")
trainer.train()

print("Pushing model to hub...")
trainer.push_to_hub("food-focus-ai")

print("Training completed successfully!")

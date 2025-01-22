# Add this at the top of train_food_model.py, after the imports
from huggingface_hub import login

# Replace 'your_token_here' with your Hugging Face token from https://huggingface.co/settings/tokens
login('your_token_here')
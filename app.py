from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from food_recognition import FoodRecognitionService
from model import FoodResponse
import uvicorn

app = FastAPI(title="Food Focus AI", description="API for food recognition and calorie estimation")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the food recognition service
food_service = FoodRecognitionService()

@app.post("/api/recognize", response_model=FoodResponse)
async def recognize_food(image: UploadFile = File(...)):
    """
    Endpoint to recognize food from uploaded image and return nutritional information
    """
    try:
        # Read image file
        image_bytes = await image.read()
        
        # Process image and get predictions
        result = food_service.process_image(image_bytes)
        
        return result
    except Exception as e:
        return {"error": str(e)}

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
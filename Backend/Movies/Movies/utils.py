import pymongo
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
import pytz  
import boto3,csv
import os
from dotenv import load_dotenv
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from app.models import LoginUser
from rest_framework.permissions import IsAuthenticated
from bson.objectid import ObjectId

import logging

logger = logging.getLogger(__name__)

load_dotenv()

client = MongoClient(os.getenv("MONGO_CLIENT"))
db = client[os.getenv("DATABASE_NAME") ]

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')


def get_mongo_client():
    return MongoClient(os.getenv("MONGO_CLIENT")) 

# Define a utility function to remove old tokens
def remove_old_tokens(username):
    client = MongoClient(os.getenv("MONGO_CLIENT"))  
    db = client[os.getenv("DATABASE_NAME")]  
    collection = db["app_loginuser"] 
    collection.delete_many({"user": username})


def save_refresh_token(username, refresh_token):
    client = get_mongo_client()
    db = client["YourDatabaseName"]
    collection = db["app_loginuser"]
    collection.insert_one({
        "user": username,
        "refresh_token": refresh_token,
        "created_at": datetime.now()
    })
    logger.info(f"Saved new refresh token for user: {username}")

@api_view(['GET'])
@permission_classes([AllowAny]) 
def getMovies(request):
    try:
        collection=db['movies']
        data=list(collection.find({},{"_id":0}))
        movieNames=[movie['title']for movie in data]
        return Response(movieNames,status=200)
    except Exception as e:
        return Response({str(e)},status=500)

@api_view(['POST'])
@permission_classes([AllowAny]) 
def addComments(request,title):
    try:
        collection1 = db['movies']
        collection2=db['comments']
        movie = collection1.find_one({'title':title})
        now = datetime.now(pytz.utc)
        formatted_date = now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + '+00:00'
        print(formatted_date)
        if movie:
            movieId = movie['_id']
            comment = {
                "name": request.data['name'],
                "email" : request.data['email'],
                "movie_id" : movieId,
                "text" : request.data['text'],
                "date": formatted_date
            }
            collection2.insert_one(comment)
            return Response("Comment added successfully",status=200)
        else:
            return Response("No Movie with such title",status=200)
    except Exception as e:
        return Response({str(e)},status=500)
    

@api_view(['GET'])
@permission_classes([AllowAny])  
def getDescription(request,title):
    try:
        name='Regeneration'
        collection=db['movies']
        movie=collection.find_one({'title':title})
        return Response({'title':movie['title'],
                        'director':movie['directors'],
                        'cast':movie['cast'],
                        'genres':movie['genres'],
                        'plot':movie['plot']},status=200)
    except Exception as e:
        return Response({str(e)},status=500)
    

@api_view(['GET'])
@permission_classes([AllowAny]) 
def getMovieComments(request,title):
    try:
        collection1=db['movies']
        collection2= db['comments']
        movie = collection1.find_one({'title':title})
        movieId = movie['_id']
        movieComments = collection2.find({'movie_id':movieId})
        comments = []
        for movieComment in movieComments:
                comments.append({
                    'title': movie['title'],
                    'name' : movieComment['name'],
                    'email' : movieComment['email'],
                    'text' : movieComment['text'],
                    'date' : movieComment['date']
                }
            )
        if len(comments)==0:
                return Response({"Message": "No comments to display"}, status=200)
        return Response(comments, status=200)
  
    except Exception as e: 
        return Response({str(e)},status=500)
    

@api_view(['POST'])
@permission_classes([AllowAny]) 
def signUp(request):
    try:
        collection = db['NewUsers']

        # Extract data
        name = request.data.get('name')
        username = request.data.get('username')
        password = request.data.get('password')

        # Debug incoming data
        print("Incoming Data:", {"name": name, "username": username, "password": password})

        # Validation
        if not all([name, username, password]):
            return Response({"error": "All fields are required"}, status=400)

        # Check if username already exists
        existing_user = collection.find_one({"username": username})
        if existing_user:
            print("Duplicate Username:", username)
            return Response({"error": "Username already exists"}, status=400)

        # Hash the password
        hashed_password = make_password(password)
        print("Hashed Password:", hashed_password)

        # Insert data
        user = {"name": name, "username": username, "password": hashed_password}
        collection.insert_one(user)
        print("User inserted successfully:", user)

        return Response({"message": "User registered successfully"}, status=201)

    except Exception as e:
        print("Error:", str(e)) 
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny]) 
def login(request):
    try:
        username = request.data.get("username")
        password = request.data.get("password")
        logger.info(f"Login request received for username: {username}")

        # Connect to MongoDB
        client = get_mongo_client()
        db = client[os.getenv("DATABASE_NAME")]
        collection = db["NewUsers"]

        # Fetch user data
        user_data = collection.find_one({"username": username})
        logger.info(f"User data fetched: {user_data}")

        # Check user credentials
        if user_data and check_password(password, user_data['password']):
            logger.info("Password verification passed")

            # Generate tokens
            refresh = RefreshToken()
            refresh["username"] = username  # Add username to the token payload
            access_token = str(refresh.access_token)
            logger.info("Tokens generated successfully")

            # Remove old tokens and save new ones
            remove_old_tokens(username)
            save_refresh_token(username, str(refresh))

            return Response({
                "refresh": str(refresh),
                "access": access_token
            }, status=200)

        logger.warning("Invalid credentials")
        return Response({"error": "Invalid credentials"}, status=401)

    except Exception as e:
        logger.error(f"Error during login: {e}", exc_info=True)
        return Response({"error": f"Error during login: {str(e)}"}, status=500)


# @api_view(['GET'])
# def trigger_sagemaker_with_mongo(request):
#     try:
#         collection = db['NewUsers']  # Replace 'user_preferences' with your actual collection name

#         # Fetch user-selected genres
#         user_id = request.GET.get('aasvenk@iu.edu')  # Pass user ID as a query parameter
#         user_data = collection.find_one({'user_id': user_id})
#         if not user_data:
#             return JsonResponse({'error': 'User data not found'}, status=404)

#         # Extract genres (ensure data is in correct format)
#         selected_genres = user_data['genres']  
#         if not selected_genres:
#             return JsonResponse({'error': 'No genres selected'}, status=400)

#         # Save genres to a temporary CSV file for SageMaker input
#         input_file_path = '/tmp/input_data.csv'
#         with open(input_file_path, 'w') as csvfile:
#             writer = csv.writer(csvfile)
#             writer.writerow(['Genres'])  # Column header
#             writer.writerow([','.join(selected_genres)])  # Row with selected genres

#         # Upload the CSV file to S3
#         s3 = boto3.client(
#             's3',
#             aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
#             aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
#         )
#         input_s3_uri = f's3://{os.getenv("S3_BUCKET_NAME")}/input/input_data.csv'
#         s3.upload_file(input_file_path, os.getenv('S3_BUCKET_NAME'), 'input/input_data.csv')

#         # Trigger SageMaker job
#         sagemaker_client = boto3.client(
#             'sagemaker',
#             aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
#             aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
#             region_name=os.getenv('AWS_REGION'),  # Example: 'us-east-1'
#         )
#         job_name = f'movie-recommendation-job-{user_id}'
#         output_s3_uri = f's3://{os.getenv("S3_BUCKET_NAME")}/output/'  # Replace with your bucket

#         response = sagemaker_client.create_transform_job(
#             TransformJobName=job_name,
#             ModelName=os.getenv('MODEL_NAME'),  # Replace with your model name
#             MaxConcurrentTransforms=1,
#             MaxPayloadInMB=6,
#             BatchStrategy='SingleRecord',
#             TransformOutput={'S3OutputPath': output_s3_uri},
#             TransformInput={
#                 'DataSource': {'S3DataSource': {'S3DataType': 'S3Prefix', 'S3Uri': input_s3_uri}},
#                 'ContentType': 'text/csv',
#             },
#             TransformResources={'InstanceType': 'ml.m5.large', 'InstanceCount': 1},
#         )

#         return JsonResponse({'message': 'SageMaker job triggered successfully!', 'response': response}, status=200)

#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)



@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_s3_file_content(request):
    try:

        bucket_name = S3_BUCKET_NAME
        file_key = 'output_to_get/output.txt' 


        s3 = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )


        response = s3.get_object(Bucket=bucket_name, Key=file_key)
        content = response['Body'].read().decode('utf-8')  

        return JsonResponse({"file_content": content}, status=200)

    except NoCredentialsError:
        return JsonResponse({"error": "AWS credentials not found"}, status=500)
    except PartialCredentialsError:
        return JsonResponse({"error": "Incomplete AWS credentials provided"}, status=500)
    except Exception as e:
        return JsonResponse({"error": f"Failed to fetch file from S3: {str(e)}"}, status=500)


@api_view(['POST','GET'])
@permission_classes([AllowAny]) 
def filter_movies_by_genres(request):
    try:
  
        genres = request.data.get('genres')
        if not genres or not isinstance(genres, list):
            return Response({'error': 'Genres must be provided as a list in the request body'}, status=400)

        collection = db['movies']
        

        movies = collection.find({'genres': {'$in': genres}}, {'_id': 0, 'title': 1})
        movie_titles = [movie['title'] for movie in movies]
        
        if not movie_titles:
            return Response({'message': 'No movies found for the selected genres'}, status=404)
        
        return Response({'movies': movie_titles}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
    
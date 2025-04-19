from pymongo import MongoClient

def get_cars_collection():
    client = MongoClient("mongodb://admin:admin@mongodb:27017/")
    db = client["voitureDB"]
    return db["voitures"]

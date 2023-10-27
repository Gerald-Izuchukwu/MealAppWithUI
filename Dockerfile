FROM node:20-alpine

RUN mkdir -p /home/MealApp/Order_Service
RUN mkdir -p /home/MealApp/Product_Service
RUN mkdir -p /home/MealApp/UserAuth_Service

COPY /Meal_User_Service /home/MealApp/UserAuth_Service
COPY /Meal_Restaurant_API(PRODUCT) /home/MealApp/Product_Service
COPY /Meal_Order_API(OrderService) /home/Meal_Order_API


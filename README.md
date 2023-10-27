# Food-Ecommerce CRUD APP - Version 1.0

This is a simple Food-Ecommerce CRUD app built with microservice architecture. It currently includes User Authentication (UserAuth MS), Product Management (Product MS), Order Management (Order MS), and plans for a Delivery Agent service in later versions.

## Getting Started

1. Change into the project repository:
   ```bash
   cd Meal-Microservice-App

2. install all the required dependecies:
    ```bash
    npm i

3. change to the Meal_User_Service folder:
    ```bash
    cd Meal-Microservice-App/Meal_User_Service

4. install all the required dependecies:
    ```bash
    npm i


### To Test User/Auth Route:
1. To register: 
> send a POST request to "http://localhost:9602/meal-api/v1/auth/register" with <^>"name"<^>, <^>"email"<^>, and <^>"password"<^>
2. 
> To login in: send a post request to "http://localhost:9602/meal-api/v1/auth/login" with  <^>"email"<^> and <^>"password"<^>
You would get a token on successful attempt. This is the token used to access certain routes

### To Test Product Route:
Copy the token into the Bearer Token
1. Get All Food: send a GET request to "http://localhost:9601/meal-api/v1/food/get-food"
2. To Buy Food: send a POST request to "http://localhost:9601/meal-api/v1/food/buy-food" with a `key=<^>"ids"<^>` and `value=<^>array<^> of the ids of food you want to order`. This will return a created order for you
3. To get Food based on type: send a GET request to "http://localhost:9601/meal-api/v1/food/get-food-type?type={type}"

Other Routes can be tested as seen in the codebase


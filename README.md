# crimmy-services

## Installation Guide
To run this application, you need to have only docker and docker-compose installed on your machine.

1. Clone the repository
```bash
git clone https://github.com/Babatunde13/crimmy-services.git
```

2. Start the application by starting the docker containers like so:
```bash
docker-compose up
```
This step runs the following services:
- `mongodb`: This is the database service, it uses a volume to persist the data on the host machine
- `rabbitmq`: This is the message broker service, it uses a volume to persist the data on the host machine
- `order-service`: This service is responsible for handling orders
- `product-service`: This service is responsible for handling products
- `owner-service`: This service is responsible for handling owners
- `gateway`: This service is responsible for routing http requests to the appropriate service

The internal services communicates with each other via rabbitmq. The `gateway` service is the only service that is exposed to the outside world.

## Documentation
The following endpoints are available for the services:
1. `order-service`
- `GET /api/v1/orders`: Get all orders
- `POST /api/v1/orders`: Create an order
- `GET /api/v1/orders/:id`: Get an order by id
- `PUT /api/v1/orders/:id`: Update an order by id
- `DELETE /api/v1/orders/:id`: Delete an order by id

2. `product-service`
- `GET /api/v1/products`: Get all products
- `POST /api/v1/products`: Create a product
- `GET /api/v1/products/:id`: Get a product by id
- `PUT /api/v1/products/:id`: Update a product by id
- `DELETE /api/v1/products/:id`: Delete a product by id

3. `owner-service`
- `GET /api/v1/owners`: Get all owners
- `POST /api/v1/auth/signup`: Create a user
- `POST /api/v1/auth/login`: Login a user
- `GET /api/v1/users/:id`: Get a user by id
- `GET /api/v1/users`: Get logged in user
- `PUT /api/v1/users`: Update logged in user
- `DELETE /api/v1/users/`: Delete logged in user

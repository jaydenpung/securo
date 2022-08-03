# Securo API

## Getting Started:

- API documentation available at [here](https://documenter.getpostman.com/view/10698630/UzkV1GHN)

- Create tables by setting synchronize of TypeOrmModule to true at app.module.ts
<img width="445" alt="image" src="https://user-images.githubusercontent.com/46307126/182480778-5dae3399-c47f-4a61-be42-aa2281314100.png">

- Alternatively, run the following queries:

```
CREATE TABLE `Customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `account_wallet_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_5ff2d3cf948ba6ad2f3a8d19df` (`email_address`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Fund` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fund_name` varchar(255) NOT NULL,
  `minimum_invest_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `fund_description` varchar(255) NOT NULL,
  `fund_investment_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Trade_History` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `starting_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `ending_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `transaction_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `transaction_date` datetime NOT NULL,
  `transaction_type` int(11) NOT NULL,
  `fund_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_b166617dc48751a063f3164f4ce` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;
```

## TODO
- Handle numbers and decimals of monetary value

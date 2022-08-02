# Securo API

## Getting Started:

- API documentation available at (here)[https://documenter.getpostman.com/view/10698630/UzkV1GHN]

- Create tables:

```
CREATE TABLE `Customer` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `account_wallet_amount` decimal(20,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_address` (`email_address`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Fund` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fund_name` varchar(255) NOT NULL,
  `fund_description` varchar(255) NOT NULL,
  `minimum_invest_amount` decimal(20,2) NOT NULL DEFAULT 0.00,
  `fund_investment_balance` decimal(20,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Trade_History` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `starting_balance` decimal(20,2) NOT NULL DEFAULT 0.00,
  `ending_balance` decimal(20,2) NOT NULL DEFAULT 0.00,
  `transaction_amount` decimal(20,2) NOT NULL DEFAULT 0.00,
  `customer_id` int(11) unsigned DEFAULT NULL,
  `fund_id` int(11) unsigned DEFAULT NULL,
  `transaction_date` datetime DEFAULT current_timestamp(),
  `transaction_type` int(2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=utf8mb4;
```

## TODO:

- Add foreignkey/setup migration for typeorm to generate tables with proper relations

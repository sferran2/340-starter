
-- Insert a new account for Tony Stark
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 1 Select the newly created account to verify insertion
SELECT * 
FROM account
WHERE account_email = 'tony@starkent.com';

-- 2 Update the account type to 'Admin' for Tony Stark
UPDATE account
SET account_type = 'Admin'
WHERE account_id = (
  SELECT account_id
  FROM account
  WHERE account_email = 'tony@starkent.com'
);

-- 3 Delete the account for Tony Stark
DELETE FROM account
WHERE account_id = (
  SELECT account_id
  FROM account
  WHERE account_email = 'tony@starkent.com'
);

-- 4 Update the inv_description for GM Hummer
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM'
AND inv_model = 'Hummer';

-- 5 Select all vehicles in the 'Sport' classification
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c
ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6 Update image paths in the inventory table
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
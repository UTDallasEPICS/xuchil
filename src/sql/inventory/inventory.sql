CREATE TABLE inventory (
	product_id INT PRIMARY KEY,	
    quantity INT,
    threshold INT,
    FOREIGN KEY (product_id) references products(product_id)
);



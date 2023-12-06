
create table users (
	id serial primary key,
	username varchar(25),
	password varchar(50),
	email varchar(255),
	profile_pic_url varchar(255)
);

create table ext_recipes (
	id serial primary key,
	title varchar(255),
	description text,
	instructions text
);

create table ingredients (
	id serial primary key,
	name varchar(255),
	type varchar(255)
);

create table user_shopping_list (
	id serial primary key,
	user_id integer REFERENCES users(id),
	item_id integer REFERENCES ingredients(id),
	quantity float,
	unit varchar(255),
	is_bought boolean,
	is_removed boolean,
	date_added date,
	date_removed date
);

create table favorite_recipes (
	id serial primary key,
	user_id integer REFERENCES users(id),
	recipe_id integer REFERENCES ext_recipes(id),
	rank integer
);

create table cuisine_types (
	id serial primary key,
	type varchar(255),
	description varchar(255)
);

create table user_kitchen (
	id serial primary key,
	user_id integer REFERENCES users(id),
	ingredient_id integer REFERENCES ingredients(id),
	quantity integer,
	unit varchar(255),
	in_fridge boolean,
	expiration_date date,
	date_added date,
	date_removed date,
	expired boolean
);

create table favorite_cuisines (
	id serial primary key,
	user_id integer REFERENCES users(id),
	cusine_id integer REFERENCES cuisine_types(id),
	rank integer
);


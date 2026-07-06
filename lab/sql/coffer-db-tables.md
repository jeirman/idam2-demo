Database name = coffer
Schema = public

## Tables

### user_profiles

```sql
CREATE TABLE public.user_profiles (
	email varchar NOT NULL,
	last_login_date timestamptz NULL,
	display_name varchar NOT NULL,
	profile_picture varchar NULL,
	active bool DEFAULT true NULL,
	CONSTRAINT user_profiles_pk PRIMARY KEY (email)
);
```

### vendors

```sql
CREATE TABLE public.vendors (
	vendor_id int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	vendor_name varchar NULL,
	country_id varchar NULL,
	CONSTRAINT vendors_pk PRIMARY KEY (vendor_id)
);
```

### currencies

```sql
CREATE TABLE public.currencies (
	currency_code varchar NOT NULL,
	currency_name varchar NOT NULL,
	CONSTRAINT currencies_pk PRIMARY KEY (currency_code)
);
```

### countries

```sql
CREATE TABLE public.countries (
	country_id varchar NOT NULL,
	country_name varchar NOT NULL,
	CONSTRAINT countries_pk PRIMARY KEY (country_id)
);
```

### invoices

```sql
CREATE TABLE public.invoices (
	invoice_id int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	status varchar DEFAULT 'submitted'::character varying NULL,
	submitted_by varchar NOT NULL,
	vendor_id int8 NULL,
	amount numeric NULL,
	currency varchar NULL,
	entry_date timestamptz NULL,
	due_date date NULL,
	submission_country varchar NULL,
	CONSTRAINT invoices_pk PRIMARY KEY (invoice_id)
);
```

### invoices_audit_log

```sql
CREATE TABLE public.invoices_audit_log (
	audit_id int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	audit_datetime timestamptz DEFAULT now() NOT NULL,
	audit_action varchar NULL,
	audit_by varchar NULL,
	audit_on int8 NULL,
	CONSTRAINT invoice_audit_log_pk PRIMARY KEY (audit_id)
);
```

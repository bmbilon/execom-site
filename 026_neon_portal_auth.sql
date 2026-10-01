--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6 (4e955f5)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: portal_auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS portal_auth;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: portal_auth; Owner: -
--

CREATE TABLE portal_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: rateLimit; Type: TABLE; Schema: portal_auth; Owner: -
--

CREATE TABLE portal_auth."rateLimit" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    count integer NOT NULL,
    "lastRequest" bigint NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: portal_auth; Owner: -
--

CREATE TABLE portal_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: portal_auth; Owner: -
--

CREATE TABLE portal_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: verification; Type: TABLE; Schema: portal_auth; Owner: -
--

CREATE TABLE portal_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: portal_auth; Owner: -
--

ALTER TABLE ONLY portal_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: rateLimit rateLimit_key_key; Type: CONSTRAINT; Schema: portal_auth; Owner: -
--

ALTER TABLE ONLY portal_auth."rateLimit"
    ADD CONSTRAINT "rateLimit_key_key" UNIQUE (key);


--
-- Name: rateLimit rateLimit_pkey; Type: CONSTRAINT; Schema: portal_auth; Owner: -
--

ALTER TABLE ONLY portal_auth."rateLimit"
    ADD CONSTRAINT "rateLimit_pkey" PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: portal_auth; Owner: -
--

ALTER TABLE ONLY portal_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: portal_auth; Owner: -
--

ALTER TABLE ONLY portal_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: portal_auth; Owner: -
--

ALTER TABLE ONLY portal_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: portal_auth; Owner: -
--

ALTER TABLE ONLY portal_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: portal_auth; Owner: -
--

ALTER TABLE ONLY portal_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: portal_auth; Owner: -
--

CREATE INDEX "account_userId_idx" ON portal_auth.account USING btree ("userId");


--
-- Name: session_userId_idx; Type: INDEX; Schema: portal_auth; Owner: -
--

CREATE INDEX "session_userId_idx" ON portal_auth.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: portal_auth; Owner: -
--

CREATE INDEX verification_identifier_idx ON portal_auth.verification USING btree (identifier);


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: portal_auth; Owner: -
--

ALTER TABLE ONLY portal_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES portal_auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: portal_auth; Owner: -
--

ALTER TABLE ONLY portal_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES portal_auth."user"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


REVOKE ALL ON SCHEMA portal_auth FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA portal_auth FROM PUBLIC;

--
-- PostgreSQL database dump
--

\restrict ggPX97R0SDeMNEejSrWyx5YU6MO2WRlWZWM9Oc20C0dWzMooFyxYX98VfxFIXji

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agents (
    agent_id integer NOT NULL,
    agent_name character varying(50) NOT NULL,
    role character varying(30) NOT NULL,
    email character varying(50) NOT NULL,
    contact_no character varying(15) NOT NULL,
    password character varying(20) NOT NULL,
    date_of_joining date NOT NULL,
    address character varying(100),
    profile_pic character varying(200),
    is_active boolean DEFAULT true
);


--
-- Name: agents_agent_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agents_agent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: agents_agent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agents_agent_id_seq OWNED BY public.agents.agent_id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    package_id integer,
    user_id integer,
    booking_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    travel_date date,
    people integer,
    price numeric(10,2),
    total_price numeric(10,2),
    status character varying(20) DEFAULT 'pending'::character varying,
    meal_preference character varying(50) DEFAULT 'Any'::character varying,
    vehicle_id integer,
    vehicle_price numeric DEFAULT 0,
    id_proof_url character varying(500),
    refund_amount numeric(10,2) DEFAULT 0,
    refund_status character varying(100) DEFAULT 'Not Applicable'::character varying,
    adults integer DEFAULT 1,
    children integer DEFAULT 0,
    CONSTRAINT status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaints (
    id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.complaints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: complaints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.complaints_id_seq OWNED BY public.complaints.id;


--
-- Name: offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers (
    id integer NOT NULL,
    package_id integer,
    name character varying(255) NOT NULL,
    description text,
    discount_percentage numeric(5,2) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: offers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: offers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offers_id_seq OWNED BY public.offers.id;


--
-- Name: package_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_reviews (
    id integer NOT NULL,
    package_id integer,
    user_name character varying(100) NOT NULL,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT package_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: package_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.package_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: package_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.package_reviews_id_seq OWNED BY public.package_reviews.id;


--
-- Name: packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.packages (
    id integer NOT NULL,
    title character varying(150) NOT NULL,
    price integer NOT NULL,
    image text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    duration_days character varying(20),
    description text,
    departure_dates jsonb DEFAULT '[]'::jsonb,
    itinerary jsonb DEFAULT '[]'::jsonb,
    hotel_images text[] DEFAULT '{}'::text[],
    is_international boolean DEFAULT false,
    max_capacity integer DEFAULT 45
);


--
-- Name: packages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.packages_id_seq OWNED BY public.packages.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    booking_id integer,
    user_id integer,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50) DEFAULT 'Mock Card'::character varying,
    payment_id character varying(255),
    transaction_id character varying(255),
    status character varying(20) DEFAULT 'successful'::character varying,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dob date,
    contact_number character varying(20),
    city character varying(100),
    state character varying(100),
    is_active boolean DEFAULT true
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: agents agent_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents ALTER COLUMN agent_id SET DEFAULT nextval('public.agents_agent_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: complaints id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints ALTER COLUMN id SET DEFAULT nextval('public.complaints_id_seq'::regclass);


--
-- Name: offers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers ALTER COLUMN id SET DEFAULT nextval('public.offers_id_seq'::regclass);


--
-- Name: package_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_reviews ALTER COLUMN id SET DEFAULT nextval('public.package_reviews_id_seq'::regclass);


--
-- Name: packages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages ALTER COLUMN id SET DEFAULT nextval('public.packages_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, name, email, password, is_active, last_login, created_at) FROM stdin;
1	aayush	aayush@test.com	$2b$10$AMX0Jv/APpQmLZQJ3DQu.uhoMDlc3Xbu4HDjiQxXgqmkrqgIz3Zzq	t	\N	2026-03-31 14:12:23.554789
\.


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agents (agent_id, agent_name, role, email, contact_no, password, date_of_joining, address, profile_pic, is_active) FROM stdin;
1	Ramesh Patel	Tour Guide	ramesh@gmail.com	9876543210	ramesh@123	2022-05-10	Ahmedabad, Gujarat	\N	t
2	Sneha Shah	Hotel Manager	sneha@gmail.com	9765432109	sneha@456	2021-08-15	Surat, Gujarat	\N	t
3	Karan Mehta	Driver	karan@gmail.com	9654321098	karan@789	2023-01-20	Vadodara, Gujarat	\N	t
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, package_id, user_id, booking_date, travel_date, people, price, total_price, status, meal_preference, vehicle_id, vehicle_price, id_proof_url, refund_amount, refund_status, adults, children) FROM stdin;
7	1	3	2026-03-31 09:30:20.729969	2026-04-10	10	5999.00	59990.00	cancelled	Any	\N	0	\N	0.00	Not Applicable	1	0
8	3	3	2026-03-31 17:24:42.156619	2026-04-09	6	9999.00	59994.00	cancelled	Any	\N	0	\N	0.00	Not Applicable	1	0
41	14	2	2026-04-23 20:30:03.493288	2026-05-27	3	16999.00	50997.00	confirmed	Veg	\N	0	/uploads/Screenshot 2026-04-23 at 4.21.20 PM.png	0.00	Not Applicable	1	0
40	10	2	2026-04-23 20:26:42.931756	2026-06-10	2	45000.00	90000.00	cancelled	Veg	\N	0	/uploads/Screenshot 2026-04-23 at 5.28.59 PM.png	0.00	Not Applicable	1	0
19	15	2	2026-01-15 10:00:00	2026-04-24	4	89999.00	359996.00	cancelled	Any	\N	0	\N	0.00	Not Applicable	1	0
16	13	3	2026-04-01 09:56:25.903299	2026-04-15	5	18500.00	92500.00	cancelled	Any	\N	0	\N	0.00	Not Applicable	1	0
46	1	2	2026-04-25 20:18:45.062314	2026-06-18	1	5999.00	5999.00	confirmed	Veg	\N	0	/uploads/1777128502390-Screenshot-2026-04-25-at-3.56.49â¯PM.png	0.00	Not Applicable	1	0
25	13	3	2026-04-19 20:01:20.15185	2026-05-07	2	18500.00	37000.00	confirmed	Any	\N	0	\N	0.00	Not Applicable	1	0
38	12	2	2024-04-23 20:08:01.003525	2024-05-14	3	75000.00	225000.00	confirmed	Veg	\N	0	\N	0.00	Not Applicable	1	0
45	1	2	2024-04-25 16:57:45.13486	2024-06-18	4	5999.00	23996.00	confirmed	Veg	\N	0	/uploads/1777116393265-Screenshot-2026-04-25-at-3.56.49â¯PM.png	0.00	Not Applicable	1	0
32	16	3	2024-04-20 14:38:41.317705	2024-04-18	1	62000.00	62000.00	confirmed	Any	\N	0	\N	0.00	Not Applicable	1	0
5	3	3	2026-01-15 10:00:00	2026-04-11	2	9999.00	19998.00	cancelled	Any	\N	0	\N	0.00	Not Applicable	1	0
4	1	3	2026-01-15 10:00:00	2026-04-19	3	5999.00	17997.00	cancelled	Any	\N	0	\N	0.00	Not Applicable	1	0
47	14	2	2024-05-04 18:19:52.869983	2024-06-10	3	16999.00	50997.00	confirmed	Veg	\N	0	/uploads/1777898965421-Screenshot-2026-04-29-at-3.23.03â¯PM.png	0.00	Not Applicable	1	0
48	11	2	2024-05-07 16:53:13.889998	2024-05-27	5	38999.00	194995.00	confirmed	Veg	\N	0	/uploads/1778152955762-Screenshot-2026-04-26-at-3.45.43â¯PM.png	0.00	Not Applicable	1	0
37	10	3	2025-04-23 19:59:47.6809	2025-05-08	2	45000.00	90000.00	confirmed	Veg	\N	0	\N	0.00	Not Applicable	1	0
15	2	2	2026-03-05 09:15:00	2026-04-09	6	7999.00	47994.00	cancelled	Any	\N	0	\N	0.00	Not Applicable	1	0
39	7	2	2025-04-23 20:21:31.584154	2025-05-09	3	22500.00	67500.00	confirmed	Veg	\N	0	/uploads/Screenshot 2026-04-23 at 5.28.59 PM.png	0.00	Not Applicable	1	0
42	6	2	2025-04-23 20:38:55.025373	2025-05-14	3	14999.00	44997.00	confirmed	Veg	\N	0	/uploads/Screenshot 2026-04-23 at 7.50.09 PM.png	0.00	Not Applicable	1	0
43	9	3	2025-04-23 20:45:59.993812	2025-05-06	2	28999.00	57998.00	confirmed	Veg	\N	0	/uploads/1776957332013-Screenshot-2026-04-23-at-7.48.37â¯PM.png	0.00	Not Applicable	1	0
18	13	2	2026-01-15 10:00:00	2026-05-03	6	18500.00	111000.00	confirmed	Any	\N	0	\N	0.00	Not Applicable	1	0
20	16	2	2026-02-20 14:30:00	2026-04-18	4	62000.00	248000.00	cancelled	Any	\N	0	\N	0.00	Not Applicable	1	0
22	15	2	2026-03-05 09:15:00	2026-04-29	2	89999.00	179998.00	confirmed	Any	\N	0	\N	0.00	Not Applicable	1	0
24	15	3	2026-03-05 09:15:00	2026-04-29	4	89999.00	359996.00	confirmed	Any	\N	0	\N	0.00	Not Applicable	1	0
35	11	3	2026-04-23 19:45:47.387564	2026-05-09	3	38999.00	116997.00	confirmed	Jain	\N	0	\N	0.00	Not Applicable	1	0
33	16	2	2025-04-22 15:33:57.384139	2025-05-10	2	62000.00	124000.00	confirmed	Jain	\N	0	\N	0.00	Not Applicable	1	0
21	17	2	2025-02-20 14:30:00	2025-04-29	1	79000.00	79000.00	confirmed	Any	\N	0	\N	0.00	Not Applicable	1	0
34	16	2	2025-04-23 17:27:21.924294	2025-05-22	3	62000.00	186000.00	confirmed	Veg	\N	0	\N	0.00	Not Applicable	1	0
36	6	3	2025-04-23 19:49:14.656555	2025-05-27	2	14999.00	29998.00	confirmed	Veg	\N	0	\N	0.00	Not Applicable	1	0
\.


--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complaints (id, user_id, message, status, created_at) FROM stdin;
1	3	Hi, I have a question about the Goa trip itinerary.	resolved	2026-03-31 22:55:23.914885
2	2	The meals are not good in this Goa Trip Package	resolved	2026-03-31 23:07:13.952888
3	2	wettyuygfdsdfghjkjhvc fde4567uhgfcvb drtyujhgvbhyt54ewedfghb frt67ujhgfdcvb hytredfg	pending	2026-04-27 14:13:28.166468
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offers (id, package_id, name, description, discount_percentage, start_date, end_date, is_active) FROM stdin;
6	3	utt	Special seasonal offer	11.00	2026-03-03	2026-03-04	t
7	1	Special Summer Blast	Special seasonal offer	8.00	2026-04-01	2026-04-15	t
\.


--
-- Data for Name: package_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.package_reviews (id, package_id, user_name, rating, comment, created_at) FROM stdin;
1	17	Testing	5	Incredible views!	2026-04-19 16:29:08.914787
2	17	12345678765432q	1	wertyuiuygfdfghjkiuytredfghjnbv	2026-04-27 14:11:10.082149
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.packages (id, title, price, image, created_at, duration_days, description, departure_dates, itinerary, hotel_images, is_international, max_capacity) FROM stdin;
9	Leh-Ladakh Expedition	28999	https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1000&auto=format&fit=crop	2026-04-01 00:26:34.844542	8 Days / 7 Nights	Calling all thrill-seekers! Embark on a breathtaking journey through the rugged terrains of Ladakh. Ride through the world's highest motorable passes, marvel at the mesmerizing changing colors of Pangong Lake, and visit ancient Buddhist monasteries.	["2026-04-23", "2026-05-06", "2026-05-16", "2026-05-29"]	["Arrival & Acclimatization. Touch down at the Kushok Bakula Rimpochee Airport in Leh. Transfer to your hotel and take complete rest for the entire day. Acclimatization to the high altitude (11,500 ft) is crucial for a safe and enjoyable expedition.", "Leh Local Sightseeing. Begin your exploration of Leh with a visit to the striking Shanti Stupa, offering panoramic views of the city. Later, explore the historic Leh Palace and spend the evening strolling through the vibrant Leh local market.", "Drive to Nubra Valley via Khardung La. Embark on a thrilling drive to Nubra Valley, crossing the legendary Khardung La Pass—one of the highest motorable roads in the world. Descend into the valley and check into your Swiss tents.", "Hunder Sand Dunes & Diskit. Visit the ancient Diskit Monastery and marvel at the towering 32-meter Maitreya Buddha statue. Later, head to the Hunder Sand Dunes to enjoy a unique ride on the double-humped Bactrian camels against a backdrop of snow-capped mountains.", "Pangong Tso via Shyok River Route. Experience a raw, adventurous drive from Nubra Valley directly to the breathtaking Pangong Tso Lake via the Shyok River route. Arrive at the lake to witness its famous color-changing, crystal-clear blue waters.", "Pangong Sunrise & Return to Leh. Wake up early to witness a mesmerizing sunrise over Pangong Lake. After breakfast, begin your scenic drive back to Leh via the Chang La Pass. Check into your hotel and rest for the evening.", "Alchi, Magnetic Hill & Sangam. Enjoy a fascinating day trip to the 11th-century Alchi Monastery. On the way back, experience the gravity-defying phenomenon at Magnetic Hill, and witness the stunning confluence (Sangam) of the green Zanskar and blue Indus rivers.", "Departure from Leh. Enjoy an early morning breakfast. Check out of your hotel and transfer to the Leh airport, taking home unforgettable memories of the rugged and beautiful landscapes of Ladakh."]	{https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1513622470522-26cb3cfd19d6?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1518602164578-cd0074062767?auto=format&fit=crop&w=1000&q=80}	f	45
12	Maldives Water Villa Experience	75000	https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1000&auto=format&fit=crop	2026-04-01 00:27:43.16902	4 Days / 3 Nights	The ultimate romantic or luxury getaway. Stay in a premium overwater villa with direct stairs into the turquoise lagoon. This package includes all-inclusive meals, a sunset dolphin cruise, complimentary snorkeling gear, and speedboat transfers from Male airport.	["2026-04-26", "2026-05-06", "2026-05-14", "2026-05-21", "2026-06-15", "2026-07-01"]	["Arrival & Speedboat Transfer. Arrive at Velana International Airport in Male. Experience a thrilling speedboat or seaplane transfer across the turquoise atolls to your luxury private island resort. Check into your breathtaking overwater villa.", "Marine Exploration. Wake up to the sound of the ocean. Step directly from your villa deck into the clear lagoon. Spend the day snorkeling in the vibrant house reef, swimming alongside colorful tropical fish, manta rays, and gentle sea turtles.", "Leisure & Sunset Cruise. Spend the morning indulging in a rejuvenating couples spa session or simply relaxing on the white sandy beaches. In the late afternoon, embark on a traditional Dhoni boat for a romantic sunset dolphin-watching cruise.", "Departure from Paradise. Enjoy a final luxurious breakfast overlooking the Indian Ocean. Check out of your water villa and take the scenic speedboat transfer back to Male airport for your departure flight."]	{https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1506180371302-39bd1e967409?auto=format&fit=crop&w=1000&q=80}	t	45
11	Magical Bali Retreat	38999	https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1000&q=80	2026-04-01 00:27:43.16902	6 Days / 5 Nights	Find your zen in the Island of the Gods. Explore the sacred monkey forest in Ubud, swing over lush green rice terraces, visit the iconic Uluwatu sea temple at sunset, and relax on the pristine beaches of Seminyak. Includes daily breakfast and private airport transfers.	["2026-04-22", "2026-05-02", "2026-05-09", "2026-05-15", "2026-05-27", "2026-06-17"]	["Arrival in Paradise. Touch down at Ngurah Rai International Airport. Meet our local representative and enjoy a scenic private transfer to your lush, tropical resort in the cultural heart of Bali, Ubud. Spend the evening relaxing by the pool.", "Ubud Culture & Nature Tour. Discover the magic of Ubud. Walk through the playful Sacred Monkey Forest, marvel at the intricately terraced Tegalalang Rice Fields, and visit the historic Ubud Royal Palace. End the day browsing the vibrant Ubud Art Market.", "Transfer to South Bali & Tanah Lot. Check out of your Ubud resort and transfer to the vibrant beach areas of Seminyak or Kuta. In the late afternoon, visit the iconic Tanah Lot Temple, perched on a rock formation in the sea, to witness a legendary Balinese sunset.", "Nusa Penida Island Excursion. Take a fast boat for a full-day excursion to the stunning Nusa Penida Island. Visit the famous T-Rex-shaped cliffs at Kelingking Beach, the natural archway of Broken Beach, and swim in the crystal-clear waters of Crystal Bay.", "Water Sports & Uluwatu Sunset. Head to Tanjung Benoa beach for a morning of exciting water sports including parasailing and banana boat rides. In the evening, visit the dramatic cliff-top Uluwatu Temple and watch a mesmerizing traditional Kecak Fire Dance at sunset.", "Departure from Bali. Enjoy a final tropical breakfast at your resort. Spend your last few hours relaxing on the beach or picking up souvenirs before your private transfer takes you to the airport for your journey home."]	{https://images.unsplash.com/photo-1570214476695-19bd467e6f7a?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1520483601560-389dff434fdf?auto=format&fit=crop&w=1000&q=80}	t	45
14	Meghalaya Nature Expedition	16999	https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1000&q=80	2026-04-01 00:27:43.16902	5 Days / 4 Nights	Journey to the abode of clouds! Trek through lush rainforests to the awe-inspiring Double Decker Living Root Bridges, take a boat ride on the crystal-clear waters of the Umngot River in Dawki, and witness the majestic Nohkalikai Falls. A pure nature lover's paradise.	["2026-04-22", "2026-05-01", "2026-05-14", "2026-05-27", "2026-06-10"]	["Arrival in Guwahati & Drive to Shillong. Arrive in Guwahati and begin your drive to Shillong, famously known as the \\"Scotland of the East\\". Stop en route to admire the expansive and beautiful Umiam Lake. Check in to your hotel in Shillong.", "Shillong Sightseeing. Spend the day exploring the charming city of Shillong. Visit the beautifully landscaped Ward's Lake, the informative Don Bosco Museum of Indigenous Cultures, and the cascading, multi-tiered Elephant Falls.", "Cherrapunjee Waterfalls & Caves. Drive to Cherrapunjee, one of the wettest places on earth. Witness the spectacular Nohkalikai Falls (India's tallest plunge waterfall), the Seven Sisters Falls, and explore the fascinating limestone formations inside Mawsmai Cave.", "Mawlynnong & Dawki River. Take a fascinating excursion to Mawlynnong, awarded the title of Asia's Cleanest Village. Walk on the incredible Living Root Bridges, and then head to Dawki to enjoy a boat ride on the crystal-clear, emerald waters of the Umngot River.", "Departure via Guwahati. Check out from your Shillong hotel after breakfast. Drive back down the hills to Guwahati. If time permits, visit the famous Kamakhya Temple before being dropped off at the airport or railway station."]	{https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1580303150536-de6a0a09e0eb?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1000&q=80}	f	45
10	Dubai Luxury Escape	45000	https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop	2026-04-01 00:27:43.16902	5 Days / 4 Nights	Experience the glitz and glamour of Dubai. This premium package includes a thrilling Desert Safari with BBQ dinner, fast-track tickets to the top of the Burj Khalifa, a traditional Dhow Cruise dinner, and ample free time for world-class shopping at the Dubai Mall.	["2026-04-15", "2026-04-26", "2026-05-02", "2026-05-08", "2026-05-22", "2026-06-10"]	["Arrival & Marina Dhow Cruise. Welcome to the glittering city of Dubai! Upon arrival, transfer to your luxury hotel. In the evening, step aboard a traditional wooden Dhow for a cruise along the Dubai Marina, enjoying a lavish buffet dinner and stunning skyline views.", "City Tour & At The Top Burj Khalifa. Take a morning half-day guided tour of Dubai, visiting the Dubai Frame and Jumeirah Mosque. In the afternoon, head to the massive Dubai Mall and ride the world's fastest elevator to the 124th-floor observation deck of the iconic Burj Khalifa.", "Thrilling Desert Safari. Enjoy a relaxed morning. In the mid-afternoon, embark on a thrilling 4x4 dune bashing adventure in the Arabian Desert. Arrive at a traditional desert camp for camel riding, henna painting, a BBQ dinner, and live belly dance performances.", "Abu Dhabi Grand Mosque Tour. Take a full-day excursion to the UAE's capital, Abu Dhabi. Marvel at the breathtaking architecture of the Sheikh Zayed Grand Mosque, drive along the scenic Corniche, and make a photo stop at the luxurious Emirates Palace hotel.", "Shopping & Departure. Spend your final morning at leisure. Take advantage of Dubai's world-class shopping at the Mall of the Emirates or the Gold Souk. Later, a private transfer will take you to Dubai International Airport for your flight home."]	{https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1000&q=80}	t	45
2	Manali Adventure	7999	https://images.unsplash.com/photo-1597167231350-d057a45dc868	2026-03-29 18:36:34.533412	5 Days / 4 Nights	Experience the majestic snow-capped peaks and lush green valleys of Manali. This adventure package includes guided mountain treks, thrilling sports at Solang Valley, a visit to the historic Hadimba Temple, and cozy bonfire evenings by the Beas River.	["2026-04-29", "2026-05-08", "2026-05-16", "2026-06-10", "2026-06-24", "2026-07-03"]	["Arrival & Mall Road Stroll. Welcome to the Valley of Gods! Arrive in Manali and check in to your mountain-view hotel. Spend the late afternoon acclimatizing to the altitude and exploring the bustling Mall Road. Enjoy a cozy dinner at the hotel while taking in the crisp mountain air.", "Solang Valley Excursion. After breakfast, head to the picturesque Solang Valley. Engage in adrenaline-pumping activities like paragliding, zorbing, and ATV rides against the breathtaking backdrop of snow-capped peaks. Return to Manali in the evening for leisure.", "Rohtang Pass or Sissu Adventure. Embark on a thrilling full-day excursion to the majestic Rohtang Pass (subject to permits/weather) or drive through the engineering marvel of the Atal Tunnel to reach the beautiful Sissu waterfall in Lahaul Valley. Experience high-altitude snow and stunning vistas.", "Local Manali Sightseeing. Discover the rich culture of Manali today. Visit the ancient Hadimba Devi Temple surrounded by towering cedar forests, the Vashisht Village known for its natural hot sulfur springs, and the peaceful Tibetan Monastery. Spend the evening cafe-hopping in Old Manali.", "Departure from the Mountains. Enjoy your final mountain breakfast. Check out of your hotel and board your Volvo or private transfer for the journey back home, carrying a lifetime of beautiful Himalayan memories."]	{https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80}	f	45
3	Kashmir Paradise	9999	https://images.unsplash.com/photo-1715457573748-8e8a70b2c1be	2026-03-29 18:36:34.533412	6 Days / 5 Nights	Discover the true "Heaven on Earth" with our premium Kashmir Paradise tour. Glide across Dal Lake in a traditional Shikara, experience the breathtaking Gondola cable car ride in Gulmarg, and stay in luxury heritage houseboats.	["2026-04-25", "2026-05-09", "2026-05-22", "2026-06-12", "2026-06-26"]	["Srinagar Arrival & Shikara Ride. Welcome to Paradise on Earth! Transfer to a luxurious premium houseboat on Dal Lake. In the late afternoon, enjoy a peaceful, romantic Shikara ride across the tranquil waters, watching the sunset over the majestic Pir Panjal mountains.", "Sonamarg \\"Meadow of Gold\\". Enjoy a full-day excursion to Sonamarg, driving through the picturesque Sindh Valley. Take a thrilling pony ride to the spectacular Thajiwas Glacier, play in the snow, and take in the breathtaking alpine scenery. Return to Srinagar for the night.", "Pahalgam \\"Valley of Shepherds\\". Check out and drive to Pahalgam, stopping at the famous saffron fields of Pampore and the ancient Awantipora ruins en route. Upon arrival, check in to your hotel and spend the evening walking along the banks of the pristine Lidder River.", "Exploring Betaab & Aru Valleys. Spend the day exploring the stunning landscapes of Pahalgam. Visit the famous Betaab Valley, known for its lush green meadows and cinematic beauty, followed by the tranquil Aru Valley. Return to the hotel for a traditional Kashmiri dinner.", "Gulmarg Gondola Experience. Drive to the spectacular meadow of flowers, Gulmarg. Experience the world-famous Gulmarg Gondola, ascending to Mount Apharwat for sweeping panoramic views of the Himalayas. Enjoy snow activities or simply relax in the alpine environment before driving back to Srinagar.", "Mughal Gardens & Departure. Visit the historic Mughal Gardens—Shalimar Bagh and Nishat Bagh—built by Emperor Jahangir. Stroll through the beautifully terraced lawns and vibrant flowerbeds before transferring to Srinagar Airport for your flight home."]	{https://images.unsplash.com/photo-1504280565551-86566838b93f?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1000&q=80}	f	45
6	Kerala Backwaters Retreat	14999	https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000&auto=format&fit=crop	2026-04-01 00:26:34.844542	5 Days / 4 Nights	Immerse yourself in "Gods Own Country". Cruise through the serene Alleppey backwaters in a traditional houseboat, witness the majestic Athirappilly waterfalls, and explore the lush green tea gardens of Munnar. A perfect blend of nature and tranquility.	["2026-04-28", "2026-05-03", "2026-05-14", "2026-05-27", "2026-06-04"]	["Arrival in Kochi & Drive to Munnar. Arrive at Cochin International Airport and embark on a highly scenic drive to Munnar. Enjoy breathtaking views of the Cardamom Hills and lush green tea plantations. Check-in to your hill-station resort and relax for the evening.", "Munnar Sightseeing. Spend the day exploring Munnar's natural beauty. Visit the sprawling Tata Tea Museum, enjoy a boat ride at Mattupetty Dam, and shout your name at Echo Point. Conclude the day with a visit to the beautiful Eravikulam National Park.", "Thekkady Wildlife Safari. Drive to Thekkady, the home of the Periyar Wildlife Sanctuary. Enjoy a serene boat safari on Periyar Lake where you can spot wild elephants, bison, and exotic birds coming to the water's edge. Evening is free for a spice plantation tour or Kathakali show.", "Alleppey Houseboat Cruise. Drive to Alleppey and board a traditional Kerala Houseboat. Cruise through the tranquil backwaters, passing by lush paddy fields, quaint villages, and coconut groves. Enjoy freshly prepared authentic Kerala cuisine on board as you spend the night on the water.", "Departure from Kochi. Wake up to a peaceful morning on the backwaters. Disembark from the houseboat after breakfast and drive back to Kochi for your departure flight, taking home memories of God's Own Country."]	{https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1000&q=80}	f	45
7	Rajasthan Royal Heritage	22500	https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1000&auto=format&fit=crop	2026-04-01 00:26:34.844542	7 Days / 6 Nights	Step back in time and live like royalty. This heritage tour covers the pink city of Jaipur, the beautiful lakes of Udaipur, and a magical night camping under the stars in the Thar Desert of Jaisalmer. Includes elephant rides and authentic Rajasthani cultural nights.	["2026-04-28", "2026-04-29", "2026-05-09", "2026-05-15", "2026-05-21"]	["Arrival in Pink City. Welcome to Jaipur! Check-in to your heritage hotel and spend the evening immersing yourself in traditional Rajasthani culture. Enjoy a vibrant folk dance performance and an authentic Rajasthani thali dinner at Chokhi Dhani village.", "Jaipur Royal City Tour. Begin the day with a visit to the majestic Amer Fort, taking an elephant or jeep ride to the entrance. Later, photograph the iconic Hawa Mahal (Palace of Winds), explore the sprawling City Palace complex, and visit the Jantar Mantar observatory.", "Drive to Jodhpur (The Blue City). After breakfast, take a scenic road trip to Jodhpur. Check-in and relax at your hotel. In the evening, take a guided walk through the bustling Sardar Market and marvel at the famous Clock Tower.", "Mehrangarh Fort & Drive to Udaipur. Explore the imposing Mehrangarh Fort, which offers sweeping views of the blue-painted houses below, and visit the marble cenotaph of Jaswant Thada. Later, drive to Udaipur, stopping en route to admire the incredibly intricate Ranakpur Jain Temples.", "Udaipur \\"City of Lakes\\" Tour. Discover the romance of Udaipur. Visit the grand City Palace overlooking Lake Pichola, the beautiful Jagdish Temple, and Saheliyon Ki Bari (Garden of the Maidens). Conclude the day with a magical sunset boat ride on Lake Pichola.", "Kumbhalgarh Fort Excursion. Take a fascinating day trip to the mighty Kumbhalgarh Fort. Walk along its massive perimeter wall—the second longest continuous wall in the world after the Great Wall of China—and enjoy panoramic views of the Aravalli hills.", "Departure from Udaipur. Enjoy a final royal breakfast at your hotel. Spend your last few hours shopping for miniature paintings and silver jewelry before transferring to the Udaipur airport for your onward journey."]	{https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1000&q=80}	f	45
15	Kyoto Heritage & Cherry Blossoms	89999	https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80	2026-04-16 15:40:21.322253	6 Days / 5 Nights	Experience the timeless elegance of Japan. Walk through thousands of vermilion torii gates at Fushimi Inari, explore the serene Arashiyama Bamboo Grove, and witness the magic of cherry blossom season. This package includes traditional tea ceremonies and guided tours of the city's most sacred temples and Zen gardens.	["2026-04-29", "2026-05-05", "2026-05-22", "2026-06-13", "2026-06-24"]	["Arrival & Transfer to Kyoto. Arrive at Kansai International Airport (Osaka). Experience the efficiency of the Japanese rail system with a fast transfer to your traditional Ryokan or hotel in Kyoto. Spend the evening resting or exploring the immediate neighborhood.", "Arashiyama Bamboo Grove & Tenryu-ji. Travel to the western outskirts of Kyoto to walk through the towering, otherworldly Arashiyama Bamboo Grove. Visit the stunning Tenryu-ji Temple with its beautiful Zen gardens, and walk across the scenic Togetsukyo Bridge.", "Fushimi Inari & Kiyomizu-dera. Embark on a hike through the thousands of iconic vermilion torii gates at the Fushimi Inari Shrine. In the afternoon, visit the UNESCO World Heritage Kiyomizu-dera Temple, offering incredible wooden architecture and views over Kyoto.", "Kinkaku-ji (Golden Pavilion) & Nijo Castle. Discover the breathtaking beauty of Kinkaku-ji, a Zen temple completely covered in gold leaf, perfectly reflected in its surrounding pond. Later, explore the sprawling grounds and \\"chirping nightingale floors\\" of Nijo Castle.", "Day Trip to Nara. Take a short train ride to Nara, Japan's first permanent capital. Meet and feed the friendly, bowing deer freely roaming in Nara Park. Marvel at the massive bronze Buddha statue housed inside the awe-inspiring Todai-ji Temple.", "Gion District & Departure. Spend your final morning walking through the historic Gion district, famous for its preserved wooden machiya houses and geisha culture. Pick up some matcha tea souvenirs before taking the express train back to the airport for your departure."]	{https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1580828369019-ea5c61dd2faa?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1590454500044-6b999fb4eb8e?auto=format&fit=crop&w=1000&q=80}	t	45
17	Swiss Alps Winter Wonderland	79000	https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80	2026-04-16 20:21:52.254353	4 Days / 3 Nights	Experience the magic of Switzerland with snow-capped peaks, warm fondue, and world-class skiing.	["2026-04-23", "2026-04-29", "2026-05-13", "2026-05-29", "2026-06-10", "2026-06-25"]	["Arrival in Zurich & Scenic Train to Interlaken. After landing, board the world-famous Swiss rail system for a breathtaking ride through snow-capped valleys. Check into your premium alpine lodge and enjoy a traditional Swiss cheese fondue welcome dinner.", "Jungfraujoch - The Top of Europe. Board the historic cogwheel train to the highest railway station in Europe. Spend the day exploring the Ice Palace, taking in panoramic views from the Sphinx Observatory, and walking on the Aletsch Glacier.", "Zermatt & The Majestic Matterhorn. Travel to the charming, car-free village of Zermatt. Take the gondola up to the Matterhorn Glacier Paradise for world-class skiing, or simply relax with hot cocoa while taking in the views of the world's most iconic mountain.", "Lake Geneva & Departure. Enjoy a final alpine breakfast before descending to the picturesque shores of Lake Geneva. Spend your afternoon shopping for world-renowned Swiss chocolates and luxury watches before your transfer to the airport."]	{https://images.unsplash.com/photo-1601705646122-79482bf42d5e?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1548625361-ec8492062635?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80}	t	45
1	Goa Trip	5999	https://images.unsplash.com/photo-1512343879784-a960bf40e7f2	2026-03-29 18:36:34.533412	4 Days / 3 Nights	Escape to the pristine, sun-kissed beaches of North and South Goa. Enjoy vibrant nightlife, exciting water sports, a relaxing cruise on the Mandovi River, and a heritage tour of Old Goa churches. Perfect for both relaxation and adventure.	["2026-04-22", "2026-04-30", "2026-05-07", "2026-05-15", "2026-05-24", "2026-06-05", "2026-06-18", "2026-06-21", "2026-07-03"]	["Arrival & Beach Relaxation. Welcome to Goa! Upon arrival at Dabolim Airport or Madgaon Station, our representative will escort you to your premium beach resort. Spend the afternoon unwinding by the pool or taking a sunset stroll along the famous Baga Beach. Enjoy a welcome dinner featuring local Goan delicacies.", "South Goa Heritage & Culture. After a hearty breakfast, embark on a cultural tour of South Goa. Visit the UNESCO World Heritage sites including the Basilica of Bom Jesus and Se Cathedral in Old Goa. After lunch, visit the Mangueshi Temple and conclude the day with a serene sunset cruise on the Mandovi River.", "North Goa Adventure & Water Sports. Gear up for an exciting day exploring North Goa. Head to Calangute and Anjuna beaches for thrilling water sports like parasailing and jet skiing. In the afternoon, explore the historic Fort Aguada for panoramic ocean views, followed by shopping at the vibrant local flea markets.", "Departure & Sweet Memories. Enjoy a leisurely morning breakfast at your resort. After completing check-out formalities, our driver will transfer you to the airport or railway station for your onward journey, leaving you with unforgettable memories of your tropical escape."]	{https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1566073171526-81f4f8b06d15?auto=format&fit=crop&w=1000&q=80}	f	45
8	Andaman Island Escape	35000	https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1000&q=80	2026-04-01 00:26:34.844542	6 Days / 5 Nights	Dive into crystal clear waters with our Andaman Island package. Experience world-class scuba diving at Havelock Island, relax on the white sands of Radhanagar Beach, and explore the historic Cellular Jail in Port Blair. An unforgettable tropical getaway.	["2026-04-23", "2026-05-06", "2026-05-28", "2026-06-02"]	["Arrival & Cellular Jail. Land in Port Blair and transfer to your hotel. In the afternoon, visit the historically significant Cellular Jail National Memorial. Stay for the moving evening Light & Sound Show that brings the history of the Indian freedom struggle to life.", "Ferry to Havelock & Radhanagar Beach. Board a luxury catamaran ferry to the beautiful Havelock Island. Check-in to your beach resort. In the afternoon, visit Radhanagar Beach (Beach No. 7), consistently ranked as one of the best beaches in Asia, to watch a spectacular sunset.", "Elephant Beach Water Sports. Embark on a morning excursion to Elephant Beach. Known for its crystal-clear waters and vibrant coral reefs, it is the perfect spot for snorkeling, scuba diving, and the unique Sea Walk experience. Return to the resort for a relaxed evening.", "Neil Island Transfer & Sunset. Take a ferry from Havelock to the tranquil Neil Island. Visit Bharatpur Beach for a glass-bottom boat ride, and later head to Laxmanpur Beach, renowned for its white sands and dramatic sunset views.", "Natural Bridge & Return to Port Blair. Visit the stunning Natural Rock Formation (Howrah Bridge) on Neil Island, a photographer's delight. In the afternoon, board the ferry back to Port Blair. Spend the evening shopping for local shell handicrafts at the Sagarika Emporium.", "Departure from Port Blair. Enjoy breakfast at your hotel before checking out. Our representative will transfer you to the Veer Savarkar International Airport with wonderful memories of your tropical island getaway."]	{https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-153756526675b-340812871f11?auto=format&fit=crop&w=1000&q=80}	f	45
13	Sikkim & Darjeeling Delights	18500	https://images.unsplash.com/photo-1516690553959-71a414d6b9b6?auto=format&fit=crop&w=1000&q=80	2026-04-01 00:27:43.16902	7 Days / 6 Nights	Wake up to breathtaking views of Mt. Kanchenjunga. Visit the famous Tiger Hill at sunrise, ride the historic Darjeeling Himalayan Railway (Toy Train), explore peaceful Buddhist monasteries in Gangtok, and walk through rolling, misty tea gardens.	["2026-04-25", "2026-05-07", "2026-05-16", "2026-05-27", "2026-06-11", "2026-06-30"]	["Arrival & Drive to Gangtok. Arrive at Bagdogra Airport or NJP Station. Embark on a highly scenic drive through the winding mountain roads alongside the Teesta River to reach Gangtok, the capital of Sikkim. Check in and explore MG Marg in the evening.", "Tsomgo Lake & Baba Mandir. Take a full-day excursion to the stunning, high-altitude Tsomgo Lake, beautifully situated in a glacial valley. Continue onward to visit the Baba Harbhajan Singh Mandir, a unique shrine dedicated to an Indian Army soldier.", "Transfer to Darjeeling. After breakfast, check out and drive to the Queen of the Hills, Darjeeling. Enjoy the views of lush green tea estates along the way. Check in to your hotel and spend the evening enjoying the cool mountain breeze at the Chowrasta Mall.", "Tiger Hill Sunrise & Local Tour. Wake up at 4:00 AM and drive to Tiger Hill to witness a spectacular sunrise over the Kanchenjunga mountain range. On the way back, visit the Batasia Loop. After breakfast, visit the Himalayan Mountaineering Institute and the Padmaja Naidu Zoo.", "Mirik Lake Excursion. Enjoy a beautiful day trip to Mirik. Drive through sprawling tea gardens to reach the serene Sumendu Lake. Enjoy boating on the lake and take a short trip to the Pashupati Nagar border market on the Indo-Nepal border.", "Tea Estate & Toy Train Ride. Spend a relaxed morning visiting a local Tea Estate to learn about the famous Darjeeling tea processing. In the afternoon, enjoy a nostalgic joyride on the UNESCO World Heritage Darjeeling Himalayan Railway (Toy Train).", "Departure. Enjoy your final mountain breakfast. Check out of your hotel and drive back down the winding roads to Bagdogra Airport or NJP Railway Station for your journey home."]	{https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1542314831-c6a4d140b4ec?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=1000&q=80}	f	45
16	Barcelona Architecture & Tapas	62000	https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80	2026-04-16 16:39:19.895378	5 Days / 4 Nights	Immerse yourself in the heart of Catalonia! Discover the genius of Gaudí at the Sagrada Familia, stroll through the vibrant Las Ramblas, and enjoy an evening of authentic tapas tasting in the Gothic Quarter. This tour perfectly blends breathtaking urban design with the rich culinary heritage of Spain.	["2026-04-01", "2026-04-18", "2026-04-24", "2026-04-29", "2026-05-10", "2026-05-22", "2026-06-17"]	["Arrival & The Gothic Quarter. Upon landing at El Prat Airport, enjoy a private transfer to your boutique hotel. Spend the late afternoon wandering the labyrinthine streets of the Gothic Quarter, followed by a welcome dinner featuring authentic Catalan tapas and local wine.", "The Genius of Gaudí. Skip the lines for a morning guided tour of the awe-inspiring Sagrada Familia. In the afternoon, head up to Park Güell to explore the vibrant mosaic terraces and enjoy panoramic views of the city skyline.", "Passeig de Gràcia & Mediterranean Vibes. Stroll down Barcelona's most famous shopping avenue to witness the striking facades of Casa Batlló and La Pedrera. Spend your afternoon relaxing at Barceloneta Beach or enjoying fresh seafood by the marina.", "Montjuïc Magic & Flamenco. Take the cable car up to Montjuïc Hill for historical fortress views and a visit to the Olympic Park. Conclude your evening in the heart of the city with a passionate, traditional Spanish Flamenco show and dinner.", "Farewell to Catalonia. Enjoy a leisurely morning with café con leche and fresh churros. Pick up some last-minute souvenirs at the bustling Mercado de La Boqueria before your private transfer takes you back to the airport."]	{https://images.unsplash.com/photo-1551882547-ff40c0d1398c?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1502672260266-1c15a824014f?auto=format&fit=crop&w=1000&q=80,https://images.unsplash.com/photo-1592229505726-9d21c45fa0cd?auto=format&fit=crop&w=1000&q=80}	t	45
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, booking_id, user_id, amount, payment_method, payment_id, transaction_id, status, payment_date) FROM stdin;
1	7	3	59990.00	Mock Card	PAY_1774929620743	TXN_1774929620743	successful	2026-03-31 09:30:20.729969
2	8	3	59994.00	Mock Card	PAY_1774958082168	TXN_1774958082168	successful	2026-03-31 17:24:42.156619
3	15	2	47994.00	Mock Card	PAY_1774982107853	TXN_1774982107853	successful	2026-04-01 00:05:07.840247
4	16	3	92500.00	Mock Card	PAY_1775017585919	TXN_1775017585919	successful	2026-04-01 09:56:25.903299
5	18	2	111000.00	Mock Card	PAY_1776324090113	TXN_1776324090113	successful	2026-04-16 12:51:30.08925
6	19	2	359996.00	Mock Card	PAY_1776334631143	TXN_1776334631143	successful	2026-04-16 15:47:11.131088
7	20	2	248000.00	Mock Card	PAY_1776337949318	TXN_1776337949318	successful	2026-04-16 16:42:29.304756
8	21	2	79000.00	Mock Card	PAY_1776596671757	TXN_1776596671757	successful	2026-04-19 16:34:31.742762
9	22	2	179998.00	Razorpay	pay_SfLnhBVhmwjttA	order_SfLkfnNJm9qGpN	successful	2026-04-19 17:56:02.958248
10	24	3	359996.00	Razorpay	pay_SfM2I6aPzHQrPU	order_SfM1lb3mPsGxxg	successful	2026-04-19 18:09:50.943022
11	25	3	37000.00	Razorpay	pay_SfNw0SlT8RXkLj	order_SfNvdwpGvnPkub	successful	2026-04-19 20:01:20.15185
18	32	3	62000.00	Razorpay	pay_SfgyQJSTUXAZqG	order_SfgxcE77Hq8bSz	successful	2026-04-20 14:38:41.317705
19	33	2	124000.00	Razorpay	pay_SgUz0nGjJ70KfW	order_SgUywGBfp8fQYW	successful	2026-04-22 15:33:57.384139
20	34	2	186000.00	Razorpay	pay_SgvRwlvqnNGHHC	order_SgvRpLALAjQokQ	successful	2026-04-23 17:27:21.924294
21	35	3	116997.00	Razorpay	pay_Sgxo986BO155iy	order_Sgxnxh7BGRsz8d	successful	2026-04-23 19:45:47.387564
22	36	3	29998.00	Razorpay	pay_SgxrnOclBUierI	order_Sgxrh8Z3iXlWHA	successful	2026-04-23 19:49:14.656555
23	37	3	90000.00	Razorpay	pay_Sgy2wjjE43Bk0o	order_Sgy2pZMCP01Mfk	successful	2026-04-23 19:59:47.6809
24	38	2	225000.00	Razorpay	pay_SgyBdWhX4G4VX2	order_SgyBYwW25Hl30L	successful	2026-04-23 20:08:01.003525
25	39	2	67500.00	Razorpay	pay_SgyPscsciZm8kN	order_SgyPmcA6Woftzk	successful	2026-04-23 20:21:31.584154
26	40	2	90000.00	Razorpay	pay_SgyVNkBDnX2ZRy	order_SgyVJMRIqF9RJE	successful	2026-04-23 20:26:42.931756
27	41	2	50997.00	Razorpay	pay_SgyYgvV67em1h8	order_SgyYZIZM4bFXRY	successful	2026-04-23 20:30:03.493288
28	42	2	44997.00	Razorpay	pay_SgyiG5kJ7LCU7B	order_Sgyi8KkgNxr46F	successful	2026-04-23 20:38:55.025373
29	43	3	57998.00	Razorpay	pay_SgyphKYMt3Z0jq	order_SgypbmSmruBv6V	successful	2026-04-23 20:45:59.993812
31	45	2	23996.00	Razorpay	pay_Shi0pGW7Am5NwJ	order_Shi0XDLKMawCfa	successful	2026-04-25 16:57:45.13486
32	46	2	5999.00	Razorpay	pay_ShlRDfTkHEj7TQ	order_ShlR8L40k5ouh4	successful	2026-04-25 20:18:45.062314
33	47	2	50997.00	Razorpay	pay_SlIDizFHxeURqK	order_SlIDaZ1nauGNRl	successful	2026-05-04 18:19:52.869983
34	48	2	194995.00	Razorpay	pay_SmSLZPyZbEy2F8	order_SmSLLmsW5AS4L4	successful	2026-05-07 16:53:13.889998
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password, created_at, dob, contact_number, city, state, is_active) FROM stdin;
4	Fenil	fenilgohil124@gmail.com	$2b$10$lrCip5rJ/olMkr0U49WnmOBm7iyZV70YRGsONjOvZNFvRzkFArW7W	2026-03-31 11:42:52.455553	2004-04-12	9737981475	Surat	Gujarat	t
3	tirth	tirth@gmail.com	$2b$10$hVq71Ej1Sode6WbotsVuH.ZEWQ97fNyN5NxoSTIzIllKuk39T7GlW	2026-03-30 15:28:16.49433	\N	7473829273	Ahmedabad	\N	t
2	yash	yash@test.com	$2b$10$P1RuwUA31T97Pw9.FonQOOEGQoNzAmxz1jY7CwXyXjuMnbS/.ZeBK	2026-03-29 18:30:06.665878	\N	\N	\N	\N	t
7	sdasd	aayushrana.1212@gmail.com	$2b$10$WODce7PFqgXxVV9YaWoQG.PWw7NQZ1ceFPE4wA9l9PmxJLz7h17GS	2026-04-27 14:24:34.332645	2026-04-16	1234567893	Addanki	Andhra Pradesh	t
5	Keyur	keyur1653@gmail.com	$2b$10$mtjDA71VplTkT9XtabGQCuyOTVOLq.w6QAGcEUjbF4G7z0BQ.E7gW	2026-04-01 09:39:04.021483	2005-01-22	6839402684	Bhavnagar	Gujarat	f
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: agents_agent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agents_agent_id_seq', 3, true);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bookings_id_seq', 48, true);


--
-- Name: complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.complaints_id_seq', 3, true);


--
-- Name: offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offers_id_seq', 7, true);


--
-- Name: package_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.package_reviews_id_seq', 2, true);


--
-- Name: packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.packages_id_seq', 17, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_id_seq', 34, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: agents agents_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_email_key UNIQUE (email);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (agent_id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: package_reviews package_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_reviews
    ADD CONSTRAINT package_reviews_pkey PRIMARY KEY (id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- Name: payments payments_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_id_key UNIQUE (payment_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: complaints complaints_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: offers offers_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: package_reviews package_reviews_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_reviews
    ADD CONSTRAINT package_reviews_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ggPX97R0SDeMNEejSrWyx5YU6MO2WRlWZWM9Oc20C0dWzMooFyxYX98VfxFIXji


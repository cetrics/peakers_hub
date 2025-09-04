-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 05, 2025 at 01:51 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `peakers_hub`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `created_at`) VALUES
(7, 'Phones', '2025-08-08 14:13:32'),
(8, 'Top Deals', '2025-08-08 14:13:40'),
(9, 'Furniture', '2025-08-08 14:13:57'),
(10, 'Handbags', '2025-08-08 14:14:07');

-- --------------------------------------------------------

--
-- Table structure for table `colors`
--

CREATE TABLE `colors` (
  `color_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `colors`
--

INSERT INTO `colors` (`color_id`, `name`) VALUES
(11, 'Black'),
(9, 'Blue'),
(10, 'Grey'),
(8, 'Red');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_addresses`
--

CREATE TABLE `delivery_addresses` (
  `address_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_type` enum('home','work','other') NOT NULL DEFAULT 'home',
  `contact_name` varchar(255) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `town` varchar(100) NOT NULL,
  `county` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Kenya',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_addresses`
--

INSERT INTO `delivery_addresses` (`address_id`, `user_id`, `address_type`, `contact_name`, `contact_phone`, `address_line1`, `address_line2`, `town`, `county`, `postal_code`, `country`, `is_default`, `created_at`, `updated_at`) VALUES
(3, 25, 'home', 'Cetric Samuel Omwembe', '0700390678', 'Kiserian Primary Road', 'Goshen Close', 'Kiserian', 'Kajiado', '2345', 'Kenya', 1, '2025-08-18 13:14:23', '2025-08-18 13:14:23'),
(4, 26, 'home', 'Cetric', '0700391535', 'Goshen Close', 'Kaurai', 'Kiserian', 'Kajiado', '1010', 'Kenya', 1, '2025-08-18 19:15:17', '2025-08-18 19:15:17'),
(5, 2, 'home', 'Alicia Myra', '0789345768', 'Kaurai', 'Matasia', 'Kiserian', 'Kajiado', '2345', 'Kenya', 1, '2025-08-20 15:06:32', '2025-08-20 15:06:32'),
(6, 25, 'home', 'Richard', 'Sikika', 'Donholm', 'Savanaah Road', 'Nairobi', 'Nairobi', '220', 'Kenya', 0, '2025-08-21 11:25:37', '2025-08-21 11:25:37');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address_id` int(11) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `order_number` varchar(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `phone_number`, `address_id`, `payment_method`, `total_amount`, `status`, `created_at`, `order_number`) VALUES
(1, 25, NULL, 3, 'mpesa', 1.16, 'Success', '2025-08-18 19:56:04', '132678'),
(2, 25, NULL, 3, 'mpesa', 1.16, 'Pending', '2025-08-20 14:51:13', '795081'),
(3, 2, NULL, 5, 'mpesa', 1.16, 'Pending', '2025-08-20 15:07:20', '383819'),
(5, 25, NULL, 3, 'mpesa', 1.16, 'Cancelled', '2025-08-20 16:39:34', '223877'),
(6, 25, NULL, 3, 'mpesa', 1.16, 'archived', '2025-08-21 11:57:12', '249209'),
(7, 25, NULL, 3, 'mpesa', 1.16, 'Pending', '2025-08-25 11:43:18', '733545');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 15, 1, 1.00),
(2, 2, 15, 1, 1.00),
(3, 3, 15, 1, 1.00),
(4, 5, 15, 1, 1.00),
(5, 6, 15, 1, 1.00),
(6, 7, 15, 1, 1.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_tracking`
--

CREATE TABLE `order_tracking` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `update_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_tracking`
--

INSERT INTO `order_tracking` (`id`, `order_id`, `status`, `description`, `update_time`) VALUES
(1, 1, 'Out for Delivery', 'I have received', '2025-08-23 14:55:20'),
(2, 7, 'Ordered', 'Order placed successfully', '2025-08-25 11:43:18');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `discount` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `category_id`, `brand`, `material`, `stock_quantity`, `image_url`, `created_at`, `discount`) VALUES
(14, '(Renewed) Apple iPhone 15 Pro Max, 256GB, Blue Titanium - Unlocked', '6.7inch Super Retina XDR display. ProMotion technology. Always-On display. Titanium with textured matte glass back. Action button\r\nDynamic Island. A magical way to interact with iPhone. A17 Pro chip with 6-core GPU\r\nPro camera system. 48MP Main | Ultra Wide| Telephoto. Super-high-resolution photos (24MP and 48MP). Next-generation portraits with Focus and Depth Control. Up to 10x optical zoom range\r\nEmergency SOS via satellite. Crash Detection. Roadside Assistance via satellite\r\nUp to 29 hours video playback. USB-C, Supports USB 3 for up to 20x faster transfers. Face ID', 120000.00, 7, 'Apple', 'Silk', 10, NULL, '2025-08-08 14:18:57', 10.00),
(15, ' (Renewed) Apple iPhone 14 Pro, 128GB, Space Black - Unlocked (Renewed) Apple iPhone 14 Pro, 128GB, Space Black - Unlocked', '6.1-inch Super Retina XDR display featuring Always-On & ProMotion.', 1.00, 7, 'Apple', 'Silk', 47, NULL, '2025-08-08 14:25:11', 0.00),
(16, 'Apple iPhone 13, 128GB, Midnight - Unlocked (Renewed) Apple iPhone 13, 128GB, Midnight - Unlocked (Renewed)', 'This pre-owned product is not Apple certified, but has been professionally inspected, tested and cleaned by Amazon-qualified suppliers.\r\nThere will be no visible cosmetic imperfections when held at an arm’s length.\r\nThis product is eligible for a replacement or refund within 90 days of receipt if you are not satisfied.\r\nProduct may come in generic Box.', 660000.00, 7, 'Apple', 'Silk', 43, NULL, '2025-08-08 14:34:19', 13.00),
(17, '(Renewed) Apple iPhone 12 Pro Max 5G, US Version, 128GB, Graphite - Unlocked', 'This phone is unlocked and compatible with any carrier of choice on GSM and CDMA networks (e.g. AT&T, T-Mobile, Sprint, Verizon, US Cellular, Cricket, Metro, Tracfone, Mint Mobile, etc.).\r\nPlease check with your carrier to verify compatibility.\r\nWhen you receive the phone, insert a SIM card from a compatible carrier. Then, turn it on, connect to Wi-Fi, and follow the on screen prompts to activate service.\r\nAccessories may not be original, but will be compatible and fully functional. Product may come in generic box.\r\nTested for battery health and guaranteed to have a minimum battery capacity of 80%.', 43000.00, 7, 'Apple', 'Silk', 21, NULL, '2025-08-08 14:39:40', 18.00),
(18, 'Women Fashion Synthetic Leather Handbags Tote Bag Shoulder Bag Top Handle Satchel Purse Set 4pcs', 'Material: Synthetic Leather(fabric),Polyester(lining).\r\nDimension: Large handbag: Top Width: 40CM,Bottom Width：30CM. Height: 27CM, Depth: 13CM. Crossbody Bag: Width: 26CM, Height: 15CM, Depth:8CM. Cosmetic Bag: Width:19CM, Height:13CM, Depth:7CM. Total weight: About 0.95kg.Please you can refer to the size before you buy it. Thank you.', 3500.00, 10, 'Handbag', 'Leather', 15, NULL, '2025-08-08 14:45:52', 10.00),
(19, 'Tote Bag for Women With Compartments,Large Canvas Tote Women\'s Purse Crossbody Bags Work Laptop Book Bag Satchels Handbags', 'Durabiliy and Large Capacity:Made of high-quality canvas and lining polyester fabric that is rugged,water-resistant,lightweight,and easy to clean.Perfect stitching help maintain its shape well even full loaded.Large capacity can fit 15.3\" laptop or tablet and all your essentials,suitable for work,daily use,student and travel.\r\nSpacious Compartments Organize Well:with 2 front outside pockets for cellphone and keys items need quick access,2 side pockets as cup holder for coffee and water bottle,and 1 big back outside pocket for ipad or magazine.with interior pocket for small belongings.Large main compartment for laptop,books,documents,cosmetics and other belongings.\r\nUpright by Itself Own:The purse with sturdy structure and solid bottom can upright on by itself,easy to place on the desktop or floor for convenience make hands free and keep inner contents from spilling.\r\nRemovable and Adjustable Shoulder Strap:With sturdy,comfortable and long top handle for shoulder carrying as versatile tote and carry-on bag.Also Designed with adjustable and removable strap for crossbody wear as cross body bag.\r\nSecure Zipper Closure:Designed with smooth and rugged zipper closure and hardware,help the belongings in the bag convenient access,also can help to protect privacy and prevent theft.\r\n', 2900.00, 10, 'Handbag', 'Leather', 89, NULL, '2025-08-08 14:52:37', 17.00),
(20, 'Tote Bags for Women Canvas Tote Purse Crossbody with Pockets Top Handle Shoulder Satchel Bag for Women', 'Premium GRS-Certified Canvas: Crafted with high-quality, lightweight, and waterproof canvas fabric, this eco-conscious tote bag for women combines durability with sustainability. GRS-certified (Global Recycled Standard), it meets rigorous environmental and ethical criteria while retaining a soft touch and easy-to-clean design—perfect for daily use.', 1000.00, 10, 'Handbag', 'Leather', 30, NULL, '2025-08-08 14:59:52', 20.00),
(21, '4PCS Women Fashion Handbags Purses Wallet Shoulder Bags Casual Tote Bag Crossbody Bags, Handbag Set Gift for Ladies Girls', 'PRACTICAL & MULTI CHOICE: Women\'s purses and handbags come in various styles and colors. 4 - in - 1 special design meets all your needs. Versatile as a handbag, crossbody, shoulder, tote, or satchel bag, matching any clothes for any occasion like dating, shopping, outings, travel, work, or parties\r\nFASHION & CASUAL STYLE: This women\'s tote purse is', 3000.00, 10, 'Handba', 'Wool', 16, NULL, '2025-08-08 15:11:50', 30.00),
(22, 'PayLessHere 32/39/47 inch Computer Desk Study Writing Table, Adjustable feet, Modern Furniture for Home Office (1, Brown, 32 inch)', 'Modern Simple Style:Elevate your workspace with our sleek and contemporary computer desk. This computer’s modern simple style adds a touch of sophistication to any home, office, study, or writing space, making it a stylish addition to your decor.\r\nDurable and Sturdy:Crafted with a robust metal frame, this computer desk is built to withstand daily use. The durable construction ensures stability and longevity, providing you with a reliable and sturdy surface for all your work and study needs.\r\nPremium & Sturdy Small Desk:Experience the perfect blend of premium materials and sturdy design with our small desk. The compact size makes it ideal for small spaces, while the sturdy structure ensures a secure platform for your computer, books, and other essentials.\r\nModern & Simple Style:Designed with a modern and simple aesthetic, this computer desk seamlessly integrates into any space. The minimalist design adds a touch of sophistication, while the simplicity ensures a clutter-free and organized work environment.\r\nFast Installation:Enjoy a hassle-free setup with our fast installation process. The easy-to-follow instructions make assembling this desk a breeze, allowing you to quickly create a functional and stylish workspace in no time.', 6000.00, 9, 'Table', 'Wool', 63, NULL, '2025-08-08 15:19:12', 30.00),
(23, 'Casaottima 32-Inch Small Computer Desk with 4 Fabric Drawers — Home Office Desks with Storage, Writing Desk with Side Hook and Cloth Bag, Modern Study/Work Table for Bedroom and Small Space, Black', '【Desk with 4 Fabric Drawers】the home desk is designed with 4 fabric drawers that provide enough storage space and ensure spacious work surface at the desktop, keeping your office or study supplies in order and dust-free.\r\n【Small Desk for Small Space】 the small desk\'s size of 31.5\"(L) x 15.8\"(W) x 29.7\"(H) is suitable for most small spaces such as bedroom, children\'s room, dormitory, etc. The desk can be used as writing desk, study desk, working desk or dressing vanity table with drawers.', 10000.00, 9, 'Table', 'Leather', 40, NULL, '2025-08-08 15:24:24', NULL),
(24, 'Amazon Basics Classic Puresoft PU Padded Mid-Back Height Adjustable Office Computer Desk Chair with Armrest, 26\"D x 23.75\"W x 42\"H, Cream', 'VERSATILE USE: Office desk chair for home office, work station, or conference room\r\nADJUSTABLE COMFORT: Adjustable seat height, adjustable seat angle, and tilt control for customizable comfort', 11999.00, 9, 'Chair', 'Leather', 11, NULL, '2025-08-08 15:30:09', 5.00),
(25, 'Office Chair Ergonomic Desk Chair - Mesh High Back Office Chair with Headrests Wheels Lumbar Support Home Desk Office Chairs Flip up Armrest Executive Rolling Swivel Task Computer Chair Black', 'Ergonomic Office Chair: The office chair contours to your body\'s curves, offering 5 key support points for head, back, lumbar, hips, and arms. The S-shaped backrest helps maintain optimal spinal posture. The 120°backrest recline function aids in spinal alignment, reducing lumbar pressure from 8+ hours of work, study, or gaming. The desk chair with 4\" of vertical seat height adjustment, it easily adapts to various desk heights and user statures', 15000.00, 9, 'Chair', 'Leather', 19, NULL, '2025-08-08 15:36:08', 30.00),
(26, '(Renewed Premium) Apple iPhone 16, US Version, 128GB, Black - Unlocked', 'This pre-owned product is not Apple certified, but has been professionally inspected, tested and cleaned by Amazon-qualified suppliers.', 83000.00, 8, 'Apple', 'Silk', 13, NULL, '2025-08-08 15:41:20', 23.00),
(27, 'Black Women Purses and Handbags for Women - Small Tote Shoulder Bag Satchel Purse with adjustable belt Fashionable Ladies bags 3 compartments summer 2025 Hobo purse', 'Material: Crafted from high-quality PU leather and lined with polyester, this crossbody handbag offers a luxurious feel and enhanced durability. The smooth metal zipper and premium hardware add an elegant touch, making shoulder purse a sophisticated accessory for any occasion.', 4333.00, 8, 'Handbag', 'Leather', 9, NULL, '2025-08-08 15:46:26', 25.00),
(28, 'CRRJU Men\'s Fashion Stainless Steel Watches Date Waterproof Chronograph Wristwatches,Stainsteel Steel Band Waterproof Watch', 'Unique Elegant Design, Showcasing Classic Taste: This watch features a sleek silver pointer design, equipped with 1/10-second, second, and minute chronographs, as well as a classic calendar display, combining functionality with elegance. Whether for business occasions or daily wear, it showcases your unique sense of style.', 5000.00, 8, 'Watches', 'Silk', 15, NULL, '2025-08-08 15:51:26', 9.00),
(29, 'Dancing Talking Cactus Toy for Baby Toddler, Boys Girls Gifts Singing Mimicking Recording Repeating What You Say Baby Toys with 120 English Songs (Adjustable Volume)', 'ADJUSTABLE VOLUME CACTUS : Dancing talking cactus with 4-level volume adjustment function meets different usage needs. When your baby needs to dance or sleep, you can adjust the volume to different levels.', 1500.00, 8, 'Toy', 'Silk', 45, NULL, '2025-08-08 15:57:22', 12.00);

-- --------------------------------------------------------

--
-- Table structure for table `product_colors`
--

CREATE TABLE `product_colors` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `color_id` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_colors`
--

INSERT INTO `product_colors` (`id`, `product_id`, `color_id`) VALUES
(64, 14, 11),
(65, 14, 10),
(68, 16, 11),
(69, 16, 9),
(70, 17, 11),
(71, 17, 10),
(72, 17, 9),
(73, 18, 11),
(74, 18, 9),
(75, 18, 10),
(76, 18, 8),
(77, 19, 9),
(78, 19, 11),
(79, 19, 10),
(80, 19, 8),
(81, 20, 11),
(82, 20, 9),
(83, 20, 10),
(84, 20, 8),
(85, 21, 11),
(86, 21, 9),
(87, 21, 10),
(88, 22, 10),
(89, 22, 11),
(90, 23, 10),
(91, 24, 11),
(92, 24, 10),
(93, 25, 11),
(94, 25, 9),
(95, 26, 11),
(96, 26, 9),
(97, 26, 10),
(98, 26, 8),
(99, 27, 11),
(100, 27, 9),
(101, 27, 10),
(102, 28, 11),
(103, 28, 9),
(104, 28, 10),
(105, 29, 11),
(106, 29, 9),
(107, 29, 10),
(108, 29, 8),
(109, 15, 11),
(110, 15, 8);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `image_filename` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_filename`) VALUES
(6, 14, 'fe329b4630ed495ab2b07d8bede7974a_iphone153.jpeg'),
(7, 14, '5f2c113614ee4b169c6b2276a8f93f63_Iphone152.jpeg'),
(8, 14, '03c1a7025cf94d1cbe0192ee32b7bc6e_iPHONE151.jpeg'),
(9, 15, 'a295d65183aa4466b9f6ba1e5fffc9c5_iphone143.jpeg'),
(10, 15, 'e6aee744e1ad4a86a39a64979d39ab58_iphone142.jpeg'),
(11, 15, 'fb60b7c7328f485da2dc55afb1a0a3ed_iphone141.jpeg'),
(12, 16, 'c73720e24b3543a18e2f91fbfa6aa649_iphone133.jpeg'),
(13, 16, '797a9f26ea634a14bfd866f2662d45b6_iphone132.jpeg'),
(14, 16, 'cf72eaf2061f4b7095be83ddeb1b9af7_iphone131.jpeg'),
(15, 17, 'b778f96078004dd2a1e07724dfd441e6_iphone123.jpeg'),
(16, 17, '7820c1a1abc742ed95259c245b91a171_Iphone122.jpeg'),
(17, 17, '649279aab2d84ded8bbf058fb7ed7eb6_Iphone121.jpeg'),
(18, 18, 'd740725ff5a3412ab3792d9045b13df2_handbag13.jpeg'),
(19, 18, 'f2d6389736ee4fe79bc356243dd1e74d_handbag12.jpeg'),
(20, 18, 'd896fea2172d437f89729eebec8474d3_handbag11.jpeg'),
(21, 19, 'e1853a57d8954172b4e5d5420017d759_handbag23.jpeg'),
(22, 19, 'c8a3f2db6b474cbfb2c7e0bf388dae95_handbag22.jpeg'),
(23, 19, '5cd74a946e0c450bae85d59b357fb809_handbag21.jpeg'),
(24, 20, '692e2a58e06a416c8e983634d90b51ac_handbag33.jpeg'),
(25, 20, '925ae24bcdbf4163bb67d975866b5195_handbag32.jpeg'),
(26, 20, 'cb282c735d2a41b6a40b90ac02479224_handbag31.jpeg'),
(27, 21, '48c54dbe99b04fb6b80fc80d5533c1b8_handbag44.jpeg'),
(28, 21, '9ca5206424e443508d9acaf800514bfd_handbag42.jpeg'),
(29, 21, '22a82c8b13bc470dab5777bc519f4eb0_handbag41.jpeg'),
(30, 22, '12764ecd4fc34ec5a1e997a25385dbf2_table13.jpeg'),
(31, 22, '5abe6155eece4237a2345188267c18e9_table12.jpeg'),
(32, 22, '57119d588349439fafd55d711a8f9f14_Table11.jpeg'),
(33, 23, '5ac42d5c7a8a418bb0da0388ff88575f_table33.jpeg'),
(34, 23, '0b0ef179d91b4b0c868c4c537d798c36_table32.jpeg'),
(35, 23, '9735ea9250934527a51fa1e1ac9f9a84_table31.jpeg'),
(36, 24, 'add2dfad2b654c7fbe2d115fa049b4c6_chair13.jpeg'),
(37, 24, '9928d1f11510480dbff31910550c9b84_chair12.jpeg'),
(38, 24, '605ac0157a074985be46fa5a59965b12_chair11.jpeg'),
(39, 25, '87ae66efb830438aaf0a80182a274df5_chair23.jpeg'),
(40, 25, 'fdacae39372542f1b9e505270f69589b_chair22.jpeg'),
(41, 25, 'da83651066964030a9b456272b68a0e9_chair21.jpeg'),
(42, 26, '68ff48670a2d480bb58d22ac401ce811_iphone163.jpeg'),
(43, 26, '6907ac125ad741a69ed66b7a3c466d2e_iphone162.jpeg'),
(44, 26, 'b118d5c71dc1482cbcbfc6017d3d5cfc_iphone161.jpeg'),
(45, 27, '29ae781542744cffaf0b72e7dbfc9a3c_top3.jpeg'),
(46, 27, '36ad602241604b0894d9afa53afd6ab8_top2.jpeg'),
(47, 27, '9940a337b0e249e4962399b49db64798_top1.jpeg'),
(48, 28, '90a010abc04c46e8aabd324d77f45cf8_watch3.jpeg'),
(49, 28, 'b0f855b60be742cfbd11a883ced1e0fd_watch2.jpeg'),
(50, 28, '8bd9e912afd2423da5a5bb0c6754a508_watch1.jpeg'),
(51, 29, 'b4e12d4540cc48d0a4d428e0ddcd9f91_baby3.jpeg'),
(52, 29, '1d1f14fb5bd14fb99874beeb78a6f596_baby2.jpeg'),
(53, 29, '620eb0b311a7443a811ead2ce0e2ea4e_baby1.jpeg');

-- --------------------------------------------------------

--
-- Table structure for table `product_ratings`
--

CREATE TABLE `product_ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `review` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_sizes`
--

CREATE TABLE `product_sizes` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_id` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_sizes`
--

INSERT INTO `product_sizes` (`id`, `product_id`, `size_id`) VALUES
(45, 14, 8),
(46, 14, 7),
(49, 16, 7),
(50, 17, 8),
(51, 17, 7),
(52, 18, 5),
(53, 18, 6),
(54, 18, 4),
(55, 19, 5),
(56, 19, 6),
(57, 19, 4),
(58, 20, 5),
(59, 20, 6),
(60, 20, 4),
(61, 21, 6),
(62, 21, 4),
(63, 22, 7),
(64, 22, 4),
(65, 23, 4),
(66, 24, 7),
(67, 25, 7),
(68, 25, 8),
(69, 26, 8),
(70, 26, 7),
(71, 27, 5),
(72, 27, 6),
(73, 27, 4),
(74, 28, 8),
(75, 28, 7),
(76, 29, 6),
(77, 29, 5),
(78, 15, 7),
(79, 15, 8);

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `size_id` int(11) NOT NULL,
  `size_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`size_id`, `size_name`) VALUES
(8, '5 inch'),
(7, '6 Inch'),
(5, 'M'),
(6, 'S'),
(4, 'XL');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `id_number` varchar(20) DEFAULT NULL,
  `user_type` enum('admin','customer') NOT NULL DEFAULT 'customer',
  `is_verified` tinyint(1) DEFAULT 0,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `id_number`, `user_type`, `is_verified`, `date_of_birth`, `gender`, `profile_image`, `last_login`, `created_at`, `updated_at`) VALUES
(2, 'Alicia', 'alicia@gmail.com', 'scrypt:32768:8:1$npYjMWySZoNnTSgz$61debd939a91c569860740e3916da4c828723f561d774039d9c0b23b884b269555dc4066f6ed0a57938e974a3dfa8f969725ce03f83a3b1d3231f8fea4ae9e82', 'Alicia', 'Omwembe', '719585252', '32341978', 'customer', 0, '2000-10-13', 'male', NULL, '2025-08-20 16:42:30', '2025-08-14 13:50:44', '2025-08-20 16:42:30'),
(3, 'Fadhili', 'fadhili@gmail.com', 'scrypt:32768:8:1$KLKykemkAz7OwD2I$39aeedda2675650ccd7356d7b037006e8ff770130a1aa5f20314fa7168c32e30100dfd922fd7fc2a6b9a8101f87efa9349adc847a27894306baeeca4c5834ce0', 'Fadhili', 'Ahava', '0789234768', '145678', 'customer', 0, '2025-08-22', 'male', NULL, NULL, '2025-08-14 13:53:58', '2025-08-14 13:53:58'),
(4, 'Martin', 'martin@gmail.com', 'scrypt:32768:8:1$ewwjmmC6jeGowuOX$01b5b92115d2b7f6c5d8daee5b94cd4e37adc6db629915139ad0e06a9d2ae8341622516c7c9462f55eaf6e77d2d04b1b6ebf44b1e18945681c90d841b224b377', 'martin', 'kamau', '78903456', '60734567', 'customer', 0, '1978-02-04', 'male', NULL, NULL, '2025-08-14 13:59:55', '2025-08-14 13:59:55'),
(5, 'Loice', 'wanjiku@gmail.com', 'scrypt:32768:8:1$DbCtWaTiWQugNBne$b17c909f94d7694298a6ff4df3de95e9c330658517daa1fb92d2265909137ec94802f1298c9873d265b8df9adadf1e4bdfe8f61940dfb1e4795e069ffe83701d', 'loice', 'wanjiku', '0789234768', '50893412', 'customer', 0, '1996-04-23', 'female', NULL, NULL, '2025-08-14 14:21:00', '2025-08-14 14:21:00'),
(6, 'Kevin', 'kevin@gmail.com', 'scrypt:32768:8:1$fcJYMOxFXGhBUW4r$aab74f73df2d4773b2e341daa1fc59a9aa4e707ed92a640d8ec7b9f6fef6ae3be65c11f4dffd41b611b0b27ca608241fd54f0d3a2cfbdfd2f2a335bc02b557a3', 'kevin', 'maina', '756342134', '234567', 'customer', 0, '1990-09-30', 'male', NULL, NULL, '2025-08-14 14:24:08', '2025-08-14 14:24:08'),
(7, 'Lilian', 'lilian@gmail.com', 'scrypt:32768:8:1$EpzuX1C18oW1lOyX$5e1c5e9e2f7fd2a3cfa8fbcfd903a7100a4094d736350b5f173ea7ad72c557373f760afb87eb8f8b4cbec1851d069846ccf918fea1a24095d78802eb6a23cbd3', 'lilian', 'wangui', '710987654', '123456', 'customer', 0, '1984-05-10', 'female', NULL, NULL, '2025-08-14 14:29:23', '2025-08-14 14:29:23'),
(8, 'Mali', 'mali@gmail.com', 'scrypt:32768:8:1$pYp2PADZGKqhwJih$6ace2998b3aad0b281fc813572ad2109ecea718b06fc31be083b25f352995ef7610455faea0a5db1c4991b1c9940e60c056c4a7d1dd5dcf2d39c5d20c37d501d', 'mali', 'Gachagua', '101456789', '10234567', 'customer', 0, '2000-01-30', 'male', NULL, NULL, '2025-08-14 14:34:49', '2025-08-14 14:34:49'),
(9, 'Wyclife', 'wyclife@gmail.com', 'scrypt:32768:8:1$ocAdzO8STKUgBdoE$0b41d0076fcbdcf2332cc829f9f3d50a9d68f9f4d19a00794b5cddd428853d27b34915cbcc27dadc4f1568b6eaa48c3d102df5681496be2fec0a3e38a6e43f0b', 'wyclife', 'oparanya', '7893421', '102030', 'customer', 0, '1919-02-28', 'male', NULL, NULL, '2025-08-14 14:38:30', '2025-08-14 14:38:30'),
(10, 'William', 'william12@gmail.com', 'scrypt:32768:8:1$VyGK1i98KQtk0UMB$1495d132c1163be8f6e1757c28ab74f649ff026fcf28e9f3d915bb61ede5442559139dc31aa02586bf44d2fc8e0c96244dfb01d00816cdb0b6f4194d0df9138a', 'william', 'mwangi', '7345789', '345678', 'customer', 0, '1993-05-13', 'male', NULL, NULL, '2025-08-14 14:43:54', '2025-08-14 14:43:54'),
(11, 'Millicent', 'millicent@gmail.com', 'scrypt:32768:8:1$6sHOCkmzskK0rjJ6$d0b972bce16a85166053905b326e6b44ddc65a7fced8f01349dff9dc163018ef99dce4cf2ba6491ced162dd4c08152ea0ba264d071875276c37b257366482448', 'millicent', 'wanjiru', '7103456', '60734567', 'customer', 0, '1987-12-04', 'male', NULL, NULL, '2025-08-14 14:46:58', '2025-08-14 14:46:58'),
(12, 'Willis', 'willis@gmail.com', 'scrypt:32768:8:1$ckclhoLB635Tzdx9$c0e830e11eb230d4e6aa958ced9bc4e0aa4a4e15b5c2e099475b741528df3260318881c487f4fedd96a15ba88ed119cce50cb5ed3e49f31b715a4d1472df666a', 'willis', 'Kamau', '10345678', '345678', 'customer', 0, '1978-03-24', 'male', NULL, NULL, '2025-08-14 14:50:13', '2025-08-14 14:50:13'),
(13, 'Esther', 'esther@gmail.com', 'scrypt:32768:8:1$pi6sWCt4xXxXvtC9$6d96943e8ee03f7a5a1c80f4614f579435cfe25b62bc1f807f98dec17bf0bccc7dfe9a65dfc22ac561ad2fe553960ac2a3e78295756cf7d15c03e00186d5f3d9', 'esther', 'awuor', '789456732', '123456', 'customer', 0, '2000-11-12', 'female', NULL, NULL, '2025-08-14 14:56:01', '2025-08-14 14:56:01'),
(14, 'Charity', 'charity@gmail.coom', 'scrypt:32768:8:1$su1dP9QgqbVzf2ka$1fc86cf8de0b35f508050dfc42b497a5bbd956015b3b1214399235af97898667ed45126122026e1a2afe1df935e98085aa95d4f28555e65743d6c3ba268250e4', 'charity', 'wangui', '789345687', '102345', 'customer', 0, '2020-02-02', 'female', NULL, NULL, '2025-08-14 14:59:30', '2025-08-14 14:59:30'),
(15, 'Sam', 'sam@gmail.com', 'scrypt:32768:8:1$SOTAbQdTNCaynPb2$3dee310ff87efb6fd644169f3b2b5d792ccb1d59b4fc3cd502490daa43bb5cbc2f1ff03ae9aaf8de09e5d1d13ae19d17934beeb639a5fddbe2369dec44d94451', 'sam', 'omondi', '10345678', '50987645', 'customer', 0, '2025-09-09', 'male', NULL, NULL, '2025-08-14 15:02:49', '2025-08-14 15:02:49'),
(16, 'Mike', 'mike@gmail.com', 'scrypt:32768:8:1$XzBX5buVGdI0gkSi$30a922090e3779418b71deb184b46cabacc28bf54bd657008fe23b48c9f8a59d98e69c1ed4f8e84bf6dbdc1859119e95c7d184053e6b9db22023dcb6127819c1', 'mike', 'mwangi', '0874324567', '10234567', 'customer', 0, '1998-04-14', 'male', NULL, NULL, '2025-08-14 15:05:59', '2025-08-14 15:05:59'),
(17, 'linda', 'linda@gmail.com', 'scrypt:32768:8:1$1FPKeA61L5d0npOV$da8a16ae958cbba30a5fa33667e33328670c77cfe3e06ed2bdaf52be80d0dca57a4a4f1452f4cd57812d16ab99719a99c53157b5e55c89f2800399301db0636d', 'linda', 'mama', '07345678', '125467', 'customer', 0, '1995-02-02', 'female', NULL, NULL, '2025-08-14 15:08:55', '2025-08-14 15:08:55'),
(18, 'kim', 'kim@gmail.com', 'scrypt:32768:8:1$HeFXPF1wDx7M8Bq9$17e47fb59f8629108948c04021edf233e0b2b741fde54ed7f13a5c804e58df05f0a7f64d8c8ecbfab346480c54ef46a633165620871c526f86b9c3f3f249191c', 'kim', 'mwangi', '78902345', '345678', 'customer', 0, '2000-06-06', 'male', NULL, NULL, '2025-08-14 15:11:00', '2025-08-14 15:11:00'),
(19, 'Wilberforce', 'wilberforce@gmail.com', 'scrypt:32768:8:1$n8c8mleHtqibqdiA$4162c5245a05000442923d3d50330e3ca68aaa005e4ef383a709b51768b36e39baa878ff2c72474bfb870aae8e288e0d5507e205e806f61c2a6ac749be026c1c', 'wilberforce', 'muturi', '7456789', '10456745', 'customer', 0, '1990-05-05', 'male', NULL, NULL, '2025-08-14 15:13:10', '2025-08-14 15:13:10'),
(20, 'Philip', 'philip@gmail.com', 'scrypt:32768:8:1$KRYutpzXLO9h4MUA$772d0a2339a61fea12db69b4a5bf26f50176b6fb4c66a88bfb113efe908d0035216306582883c8da2cfc56a2c3d20891cfdfc6850e93b4dfe066d96b4c631f95', 'philip', 'mwangi', '700345678', '102345', 'customer', 0, '1995-07-07', 'male', NULL, NULL, '2025-08-14 18:06:20', '2025-08-14 18:06:20'),
(21, 'Wafula', 'wafula@gmail.com', 'scrypt:32768:8:1$haZqfZpA14p22Ruc$7f88ec5a1e00a4982b2aecfc2c8810558b2878fde61727146d1a570b261b5a88bea0c600ffbc36f1c0be816e48ee8ded1b25d4be3aa3487c5c9f6a89d9d29aa3', 'wafula', 'mwangi', '756345567', '1567890', 'customer', 0, '1990-02-03', 'male', NULL, NULL, '2025-08-14 18:39:07', '2025-08-14 18:39:07'),
(22, 'Milah', 'milah@gmail.com', 'scrypt:32768:8:1$KzrQXCXc42gVz7XV$2e73c5e103562b5b287e44525a09e9fddb8765fa8fd4feff57f76c6d510b9e2574b96fabc31bcd9e998ef7a007f40bb8d73d2984426337e71f6af89d4e6ff802', 'milah', 'muli', '767564345', '106745', 'customer', 0, '2000-05-05', 'female', NULL, NULL, '2025-08-14 18:44:42', '2025-08-14 18:44:42'),
(23, 'Nalia', 'nalia@gmail.com', 'scrypt:32768:8:1$hvCqcmBTQwH5F0Mr$27e3d9da8aca5d03e53d621066a46007653c143d43a8327c5ec889fd261ae7a52335ccde3ae3fe5e961bfb668e381cbb804955b5a20cd29e17d609bda4d463d9', 'nalia', 'mwangi', '790456789', '407867', 'customer', 0, '1990-03-03', 'female', NULL, NULL, '2025-08-14 18:58:26', '2025-08-14 18:58:26'),
(24, 'Myra', 'myra@gmail.com', 'scrypt:32768:8:1$4mRFrQLTFKrTYnWL$a8da3fc72a5bc550a280742c2aef1d52cf0d55815718df68cb158c391c88faf8812268c3b0558fcbb71dd24ceaec0607864dec7ca279749c3ca8bee8a4ca2a8f', 'myra', 'Omwembe', '789034567', '102345', 'customer', 0, '1997-06-06', 'female', NULL, NULL, '2025-08-14 19:08:56', '2025-08-14 19:08:56'),
(25, 'Joy', 'joy@gmail.com', 'scrypt:32768:8:1$Smeq5JjkCYSTJBg8$589b5f3d6f73984f9523ce4f705173a47339a7087d93307f955e20131a88c794778d8ee75bbbfe89249f0c87949bad82fd70a16af539435c923100d21156cd57', 'joy', 'mima', '789023456', '323456', 'customer', 0, '2004-09-19', 'female', NULL, '2025-08-21 11:56:46', '2025-08-14 19:11:44', '2025-08-21 11:56:46'),
(26, 'cetric', 'scetric@gmail.com', 'scrypt:32768:8:1$rBbMVxWNmtzFPU33$5493cc4a74d56077647155c07d512919aa2bfef1277b0bedee906c40da77d3e67abf3a08817d957d181e3e940886922f7f8b4bf8b3636cc3cac489d0b6222b14', 'cetric', 'Admin', '700391535', '378956', 'admin', 0, '1990-06-06', 'male', NULL, '2025-08-18 19:12:30', '2025-08-15 20:12:52', '2025-08-18 19:12:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `colors`
--
ALTER TABLE `colors`
  ADD PRIMARY KEY (`color_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `delivery_addresses`
--
ALTER TABLE `delivery_addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_colors`
--
ALTER TABLE `product_colors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_ratings`
--
ALTER TABLE `product_ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`size_id`),
  ADD UNIQUE KEY `size_name` (`size_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `colors`
--
ALTER TABLE `colors`
  MODIFY `color_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `delivery_addresses`
--
ALTER TABLE `delivery_addresses`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_tracking`
--
ALTER TABLE `order_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `product_colors`
--
ALTER TABLE `product_colors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `product_ratings`
--
ALTER TABLE `product_ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_sizes`
--
ALTER TABLE `product_sizes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `size_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `delivery_addresses`
--
ALTER TABLE `delivery_addresses`
  ADD CONSTRAINT `delivery_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD CONSTRAINT `order_tracking_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_colors`
--
ALTER TABLE `product_colors`
  ADD CONSTRAINT `product_colors_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_ratings`
--
ALTER TABLE `product_ratings`
  ADD CONSTRAINT `product_ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_ratings_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD CONSTRAINT `product_sizes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

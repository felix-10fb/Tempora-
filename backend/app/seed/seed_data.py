import sys
import os
import uuid
from datetime import datetime, timedelta, timezone

# Ensure project root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from backend.app.core.database import SessionLocal, engine, Base
from backend.app.core.security import hash_password
from backend.app.models.models import (
    User, UserPreference, Address, Category, Listing, ListingImage,
    Booking, Review, Dispute, Notification, UserRole, ListingStatus,
    BookingStatus, PaymentStatus, DisputeStatus
)

def run_seed():
    print("[*] Initializing Neon PostgreSQL Database Tables...")
    Base.metadata.create_all(bind=engine)
    print("[+] Tables created or verified.")

    db = SessionLocal()
    try:
        # Check if already seeded
        existing_admin = db.query(User).filter(User.email == "admin@tempora.io").first()
        if existing_admin:
            print("[i] Database already contains seed data. Refreshing essential records...")
            return

        print("[*] Seeding Categories...")
        categories_data = [
            ("Furniture", "furniture", "Designer living, bedroom & work furniture", "Armchair", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"),
            ("Clothing", "clothing", "Occasion wear, suits, designer dresses & tuxedos", "Shirt", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"),
            ("Electronics", "electronics", "Laptops, gaming consoles, monitors & audio", "Laptop", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"),
            ("Appliances", "appliances", "Refrigerators, washers, microwaves & ACs", "Refrigerator", "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800"),
            ("Cameras & Creator Equipment", "cameras", "Cinema cameras, prime lenses, gimbals & mics", "Camera", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"),
            ("Event Equipment", "events", "PA systems, disco lights, foggers & stage props", "Music", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800"),
            ("Sports Equipment", "sports", "Trekking gear, golf sets, cycles & surfboards", "Bike", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800"),
            ("Study/Office Equipment", "study-office", "Ergonomic setups, whiteboards & study carrels", "Briefcase", "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"),
            ("Other", "other", "Niche equipment and unique temporary tools", "Box", "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800")
        ]

        for name, slug, desc, icon, img in categories_data:
            c = Category(
                id=str(uuid.uuid4()),
                name=name,
                slug=slug,
                description=desc,
                icon=icon,
                image_url=img,
                is_active=True
            )
            db.add(c)
        db.flush()

        print("[*] Seeding Users (Admin, Owners, Renters)...")
        # 1. Admin
        admin_user = User(
            id=str(uuid.uuid4()),
            name="Alexander Vance (Admin)",
            email="admin@tempora.io",
            phone="+91 98840 12345",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
            is_verified=True,
            is_active=True,
            trust_score=99,
            bio="TEMPORA Platform Operations & Trust Executive.",
            profile_image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
        )
        db.add(admin_user)

        # 2. Demo Owner
        demo_owner = User(
            id=str(uuid.uuid4()),
            name="Priya Ramachandran",
            email="owner@tempora.io",
            phone="+91 98401 55678",
            password_hash=hash_password("owner123"),
            role=UserRole.OWNER,
            is_verified=True,
            is_active=True,
            trust_score=96,
            bio="Curator of high-end ergonomics, designer apparel, and studio optics.",
            profile_image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
        )
        db.add(demo_owner)

        # 3. Demo Customer
        demo_customer = User(
            id=str(uuid.uuid4()),
            name="Rahul Sundaram",
            email="customer@tempora.io",
            phone="+91 94440 98765",
            password_hash=hash_password("customer123"),
            role=UserRole.CUSTOMER,
            is_verified=True,
            is_active=True,
            trust_score=91,
            bio="Software engineer & photographer on temporary assignment in Chennai.",
            profile_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
        )
        db.add(demo_customer)
        db.flush()

        # Seed additional realistic owners & renters
        created_owners = [demo_owner]
        owner_profiles = [
            ("Kavita Menon", "kavita.m@gmail.com", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"),
            ("Vikram Singhania", "vikram.s@outlook.com", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"),
            ("Aanya Deshmukh", "aanya.d@gmail.com", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400"),
            ("Arjun Nambiar", "arjun.n@techcorp.in", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400"),
            ("Meera Iyer", "meera.iyer@chennai.studio", "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400")
        ]
        for name, email, img in owner_profiles:
            u = User(
                id=str(uuid.uuid4()),
                name=name,
                email=email,
                password_hash=hash_password("password123"),
                role=UserRole.OWNER,
                is_verified=True,
                is_active=True,
                trust_score=94,
                profile_image=img
            )
            db.add(u)
            created_owners.append(u)

        created_renters = [demo_customer]
        for i in range(1, 15):
            u = User(
                id=str(uuid.uuid4()),
                name=f"Member {i}",
                email=f"renter{i}@tempora.io",
                password_hash=hash_password("password123"),
                role=UserRole.CUSTOMER,
                is_verified=True,
                is_active=True,
                trust_score=88 + (i % 10),
                profile_image=f"https://api.dicebear.com/7.x/avataaars/svg?seed=user{i}"
            )
            db.add(u)
            created_renters.append(u)

        db.flush()

        print("[*] Seeding Listings across categories with realistic photos & coordinates...")
        # Chennai coordinates centered around 13.0827, 80.2707 (Adyar, T. Nagar, Anna Nagar, OMR, Nungambakkam)
        sample_listings_data = [
            # Furniture
            (
                "Herman Miller Aeron Ergonomic Task Chair (Size B)",
                "The gold standard in office seating. Fully adjustable posture fit SL, graphite frame, tilt limiter, forward seat angle. Cleaned and sanitized.",
                "Furniture", "Office Chair", "Excellent", 199.0, 1100.0, 3800.0, 4000.0,
                "Adyar, Chennai", "Chennai", 13.0012, 80.2565,
                ["https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800", "https://images.unsplash.com/photo-1580481077195-c22ae982a5a5?w=800"]
            ),
            (
                "Solid Teak Minimalist Study & Work Desk (120x60cm)",
                "Warm natural teak finish with cable management tray, matte black steel hairpin legs. Ideal for focused remote work or exam preparation.",
                "Furniture", "Study Desk", "Pristine", 149.0, 790.0, 2600.0, 2500.0,
                "T. Nagar, Chennai", "Chennai", 13.0418, 80.2341,
                ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800", "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"]
            ),
            (
                "Queen Size Platform Bed with 8-inch Memory Foam Mattress",
                "Includes solid wood headboard frame and orthopedic contour memory foam mattress. Includes waterproof allergen cover.",
                "Furniture", "Bed & Mattress", "Like New", 299.0, 1690.0, 5200.0, 5000.0,
                "Anna Nagar, Chennai", "Chennai", 13.0850, 80.2101,
                ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800", "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?w=800"]
            ),
            (
                "Scandinavian 3-Seater Fabric Sofa (Slate Grey)",
                "Plush high-density foam cushions with stain-resistant textured upholstery. Compact design suited for 1BHK/2BHK city apartments.",
                "Furniture", "Living Room Sofa", "Very Good", 249.0, 1400.0, 4400.0, 4500.0,
                "Nungambakkam, Chennai", "Chennai", 13.0626, 80.2425,
                ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"]
            ),
            (
                "Nordic Minimalist Oak Dining Set (Table + 4 Chairs)",
                "Natural oak dining table with four sculpted ergonomic chairs. Perfect for temporary family setups or client hosting.",
                "Furniture", "Dining Set", "Excellent", 220.0, 1250.0, 3900.0, 4000.0,
                "Besant Nagar, Chennai", "Chennai", 12.9996, 80.2705,
                ["https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800"]
            ),
            # Electronics & Cameras
            (
                "Sony FX3 Cinema Line Full-Frame Camera Kit",
                "Includes Sony FX3 cage, Sony 24-70mm f/2.8 GM II Lens, 2x CFexpress Type A 160GB cards, 4x batteries and Pelican hard case.",
                "Cameras & Creator Equipment", "Cinema Camera", "Pristine", 1890.0, 8900.0, 24000.0, 25000.0,
                "Alwarpet, Chennai", "Chennai", 13.0336, 80.2497,
                ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"]
            ),
            (
                "Apple Studio Display 27-inch 5K Retina",
                "600 nits brightness, P3 wide color, 12MP Ultra Wide camera with Center Stage, studio-quality three-mic array, six-speaker sound system.",
                "Electronics", "Monitors", "Pristine", 699.0, 3600.0, 10500.0, 12000.0,
                "OMR Thoraipakkam, Chennai", "Chennai", 12.9344, 80.2312,
                ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]
            ),
            (
                "Sony PlayStation 5 Disc Edition + 2 DualSense Controllers",
                "Includes PS5 console, 2 controllers, charging dock, Spider-Man 2, and EA FC 24. Perfect for gaming weekends or party hosting.",
                "Electronics", "Gaming Console", "Like New", 499.0, 2400.0, 6900.0, 8000.0,
                "Velachery, Chennai", "Chennai", 12.9815, 80.2180,
                ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800"]
            ),
            (
                "DJI Ronin RS 3 Pro Gimbal Stabilizer Combo",
                "Automated axis locks, carbon fiber construction, 4.5kg payload, LiDAR focusing range finder, RavenEye image transmission.",
                "Cameras & Creator Equipment", "Stabilizer", "Excellent", 890.0, 4200.0, 12000.0, 10000.0,
                "Mylapore, Chennai", "Chennai", 13.0368, 80.2676,
                ["https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=800"]
            ),
            # Clothing
            (
                "Armani Exchange Tailored Italian Wool Suit (Black, 40R / M)",
                "Super 120s wool single-breasted blazer with flat-front trousers. Freshly dry-cleaned and packaged in breathable suit bag.",
                "Clothing", "Suits & Blazers", "Pristine", 399.0, 1800.0, 5200.0, 3000.0,
                "Poes Garden, Chennai", "Chennai", 13.0475, 80.2520,
                ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"]
            ),
            (
                "Sabyasachi Heritage Silk Embroidered Lehenga Set",
                "Handcrafted crimson raw silk lehenga with intricate zardozi embroidery, blouse, and double dupatta. Ideal for weddings and gala events.",
                "Clothing", "Ethnic Couture", "Like New", 1499.0, 6900.0, 18000.0, 15000.0,
                "Nungambakkam, Chennai", "Chennai", 13.0600, 80.2400,
                ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"]
            ),
            (
                "Hugo Boss Velvet Evening Tuxedo (Midnight Navy, Size 38R)",
                "Satin shawl lapels, silk-covered buttons, tailored fit trousers with satin side piping. For black-tie evenings and red carpet galas.",
                "Clothing", "Suits & Blazers", "Pristine", 450.0, 2100.0, 5800.0, 4000.0,
                "Egmore, Chennai", "Chennai", 13.0732, 80.2609,
                ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800"]
            ),
            # Appliances
            (
                "LG 260L Smart Inverter Double Door Refrigerator",
                "Frost-free multi air flow cooling, auto smart connect, energy efficient 3-star rating. Ideal for bachelor or couple 6-month stay.",
                "Appliances", "Refrigerators", "Very Good", 299.0, 1500.0, 4200.0, 4000.0,
                "Kilpauk, Chennai", "Chennai", 13.0827, 80.2400,
                ["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800"]
            ),
            (
                "IFB 7kg Front Load Fully Automatic Washing Machine",
                "Steam wash technology, cradle wash for delicates, anti-vibration system. Clean and descaled before dispatch.",
                "Appliances", "Washing Machines", "Good", 260.0, 1350.0, 3800.0, 3500.0,
                "Perungudi, Chennai", "Chennai", 12.9654, 80.2461,
                ["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800"]
            ),
            # Sports & Events
            (
                "JBL PartyBox 710 High Power Wireless Sound System",
                "800W RMS output, synchronized dynamic light show, splashproof IPX4, dual mic and guitar inputs. Unbeatable for parties.",
                "Event Equipment", "Audio Systems", "Excellent", 850.0, 3800.0, 11000.0, 8000.0,
                "ECR Palavakkam, Chennai", "Chennai", 12.9583, 80.2589,
                ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800"]
            ),
            (
                "Trek Marlin 7 Gen 3 Mountain Bike (Large Frame)",
                "RockShox Judy fork with lockout, Shimano Deore 1x10 drivetrain, hydraulic disc brakes. Tuned for weekend city rides and trails.",
                "Sports Equipment", "Cycles", "Pristine", 350.0, 1600.0, 4800.0, 5000.0,
                "Adyar, Chennai", "Chennai", 13.0033, 80.2550,
                ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800"]
            )
        ]

        created_listings = []
        for idx, item in enumerate(sample_listings_data):
            owner = created_owners[idx % len(created_owners)]
            title, desc, cat, subcat, cond, p_day, p_wk, p_mo, dep, loc, city, lat, lng, imgs = item
            
            l = Listing(
                id=str(uuid.uuid4()),
                owner_id=owner.id,
                title=title,
                description=desc,
                category=cat,
                subcategory=subcat,
                condition=cond,
                price_per_day=p_day,
                price_per_week=p_wk,
                price_per_month=p_mo,
                security_deposit=dep,
                location=loc,
                city=city,
                latitude=lat,
                longitude=lng,
                status=ListingStatus.APPROVED,
                verification_status="VERIFIED",
                rating=4.8 + (idx % 3) * 0.1,
                review_count=8 + (idx * 3),
                delivery_available=True,
                pickup_available=True
            )
            db.add(l)
            db.flush()

            for order, img_url in enumerate(imgs):
                lim = ListingImage(
                    id=str(uuid.uuid4()),
                    listing_id=l.id,
                    image_url=img_url,
                    sort_order=order
                )
                db.add(lim)
            created_listings.append(l)

        db.flush()

        print("[*] Seeding Sample Bookings & Reviews...")
        for i in range(5):
            listing = created_listings[i]
            renter = created_renters[i]
            start = datetime.now(timezone.utc) - timedelta(days=10 + i * 5)
            end = start + timedelta(days=7)

            booking = Booking(
                id=str(uuid.uuid4()),
                listing_id=listing.id,
                renter_id=renter.id,
                owner_id=listing.owner_id,
                start_date=start,
                end_date=end,
                rental_days=7,
                rental_amount=listing.price_per_week or (listing.price_per_day * 7),
                delivery_fee=149.0,
                protection_fee=85.0,
                security_deposit=listing.security_deposit,
                platform_fee=120.0,
                total_amount=(listing.price_per_week or 1500) + 149 + 85 + 120 + listing.security_deposit,
                delivery_type="DELIVERY",
                status=BookingStatus.ACTIVE if i == 0 else BookingStatus.COMPLETED,
                payment_status=PaymentStatus.PAID
            )
            db.add(booking)
            db.flush()

            # Add review
            rev = Review(
                id=str(uuid.uuid4()),
                booking_id=booking.id,
                reviewer_id=renter.id,
                reviewee_id=listing.owner_id,
                listing_id=listing.id,
                rating=5 if i % 2 == 0 else 4,
                comment="Pristine condition and effortless drop-off. Saved me thousands compared to buying! Would rent again in a heartbeat."
            )
            db.add(rev)

        print("[*] Seeding Sample Dispute for Admin Review...")
        sample_dispute = Dispute(
            id=str(uuid.uuid4()),
            booking_id=created_listings[0].bookings[0].id if created_listings[0].bookings else booking.id,
            raised_by=created_owners[0].id,
            reason="Cosmetic scratch on side frame",
            description="Item returned with a small scrape on the lower left casing. Owner requesting partial deposit deduction for buffing.",
            evidence=["https://images.unsplash.com/photo-1580481077195-c22ae982a5a5?w=800"],
            status=DisputeStatus.OPEN,
            admin_notes="AI Item Inspection shows pre-existing wear on baseline image. Reviewing before/after scans."
        )
        db.add(sample_dispute)

        print("[*] Seeding Notifications...")
        n1 = Notification(
            id=str(uuid.uuid4()),
            user_id=demo_customer.id,
            type="WELCOME",
            title="Welcome to TEMPORA!",
            message="Discover local temporary ownership. Why buy what you only need temporarily?",
            link="/search"
        )
        n2 = Notification(
            id=str(uuid.uuid4()),
            user_id=demo_owner.id,
            type="EARNINGS_UPDATE",
            title="Monthly Payout Scheduled",
            message="Your rental payouts for this cycle are being processed to your registered account.",
            link="/owner"
        )
        db.add(n1)
        db.add(n2)

        db.commit()
        print("[+] Neon PostgreSQL Seed Data Created Successfully!")
        print("--------------------------------------------------")
        print("Demo Accounts:")
        print("Admin:    admin@tempora.io    / admin123")
        print("Owner:    owner@tempora.io    / owner123")
        print("Customer: customer@tempora.io / customer123")
        print("--------------------------------------------------")

    except Exception as e:
        db.rollback()
        print(f"[-] Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()

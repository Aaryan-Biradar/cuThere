import db from '../src/lib/db.js';

async function buildDatabase() {
    console.log("🚀 Booting up the Database Builder (Turso)...");

    console.log("🧹 Sweeping old tables (if any)...");

    // Clean slate: drop tables if you ever need to re-run the script
    const dropTables = [
        `DROP TABLE IF EXISTS FOLLOWS;`,
        `DROP TABLE IF EXISTS CATEGORIZED_AS;`,
        `DROP TABLE IF EXISTS HOSTS;`,
        `DROP TABLE IF EXISTS RSVPs;`,
        `DROP TABLE IF EXISTS CATEGORY;`,
        `DROP TABLE IF EXISTS EVENT;`,
        `DROP TABLE IF EXISTS ORGANIZATION;`,
        `DROP TABLE IF EXISTS STUDENT;`
    ];

    for (const statement of dropTables) {
        await db.execute(statement);
    }

    console.log("🏗️  Building the 3NF Architecture...");

    const createTables = [
        `CREATE TABLE STUDENT (
            student_id TEXT PRIMARY KEY,
            student_name TEXT NOT NULL,
            student_email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );`,
        `CREATE TABLE ORGANIZATION (
            org_id TEXT PRIMARY KEY,
            org_name TEXT UNIQUE NOT NULL
        );`,
        `CREATE TABLE EVENT (
            event_id TEXT PRIMARY KEY,
            event_title TEXT NOT NULL,
            event_description TEXT,
            event_date TEXT NOT NULL, 
            event_time TEXT NOT NULL,
            event_location TEXT NOT NULL,
            displayUrl TEXT,
            postUrl TEXT
        );`,
        `CREATE TABLE HOSTS (
            event_id TEXT,
            org_id TEXT,
            PRIMARY KEY (event_id, org_id),
            FOREIGN KEY (event_id) REFERENCES EVENT(event_id),
            FOREIGN KEY (org_id) REFERENCES ORGANIZATION(org_id)
        );`,
        `CREATE TABLE CATEGORY (
            category_id TEXT PRIMARY KEY,
            category_name TEXT UNIQUE NOT NULL,
            category_description TEXT
        );`,
        `CREATE TABLE RSVPs (
            student_id TEXT NOT NULL,
            event_id TEXT NOT NULL,
            rsvp_status TEXT NOT NULL,
            PRIMARY KEY (student_id, event_id),
            FOREIGN KEY (student_id) REFERENCES STUDENT(student_id),
            FOREIGN KEY (event_id) REFERENCES EVENT(event_id)
        );`,
        `CREATE TABLE CATEGORIZED_AS (
            event_id TEXT NOT NULL,
            category_id TEXT NOT NULL,
            PRIMARY KEY (event_id, category_id),
            FOREIGN KEY (event_id) REFERENCES EVENT(event_id),
            FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id)
        );`,
        `CREATE TABLE FOLLOWS (
            student_id TEXT NOT NULL,
            category_id TEXT NOT NULL,
            PRIMARY KEY (student_id, category_id),
            FOREIGN KEY (student_id) REFERENCES STUDENT(student_id),
            FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id)
        );`
    ];

    for (const statement of createTables) {
        await db.execute(statement);
    }

    console.log("🏷️  Seeding curated categories...");

    // 3. Seed the master list of curated tags
    const masterTags = [
        { id: "cat_academic",           name: "Academic",              desc: "Lectures, workshops, and study sessions" },
        { id: "cat_social",             name: "Social",                desc: "Hangouts, mixers, and social gatherings" },
        { id: "cat_careernetworking",   name: "Career & Networking",   desc: "Job fairs, resume workshops, and networking events" },
        { id: "cat_techsoftware",       name: "Tech & Software",       desc: "Hackathons, coding sessions, and tech talks" },
        { id: "cat_freefood",           name: "Free Food",             desc: "Events offering free food or drinks" },
        { id: "cat_artsculture",        name: "Arts & Culture",        desc: "Art shows, performances, and cultural events" },
        { id: "cat_sports",             name: "Sports",                desc: "Intramurals, fitness events, and sports tournaments" },
    ];

    for (const tag of masterTags) {
        await db.execute({
            sql: `
                INSERT INTO CATEGORY (category_id, category_name, category_description) 
                VALUES (?, ?, ?)
            `,
            args: [tag.id, tag.name, tag.desc]
        });
    }

    console.log("✅ Database successfully created and seeded on Turso. Ready for real data!");
}

buildDatabase().catch(console.error);
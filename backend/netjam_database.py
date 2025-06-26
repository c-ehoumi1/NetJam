import sqlite3

netjam_db = sqlite3.connect('netjam.db')

n = netjam_db.cursor()

n.execute("""
    CREATE TABLE users (
        user_id INTEGER PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        profile_picture_url TEXT,
        created_at TEXT NOT NULL             
    )       
""" )

n.execute("""
    CREATE TABLE resources (
        resource_id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        title TEXT,
        description TEXT,
        notes TEXT,
        saved_at TEXT NOT NULL,
        privacy_setting TEXT NOT NULL DEFAULT 'public',
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
""")

n.execute("""
    CREATE TABLE tags(
        tag_id INTEGER PRIMARY KEY,
        tag_name TEXT NOT NULL UNIQUE
    )
""")

n.execute("""
    CREATE TABLE resource_tags(
        resource_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (resource_id, tag_id),
        FOREIGN KEY (resource_id) REFERENCES resources(resource_id),
        FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
    )
""")

n.execute("""
    CREATE TABLE collections (
        collection_id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        collection_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
""")

n.execute("""
    CREATE TABLE collection_resources (
        collection_id INTEGER NOT NULL,
        resource_id INTEGER NOT NULL,
        PRIMARY KEY (collection_id, resource_id),
        FOREIGN KEY (collection_id) REFERENCES collections(collection_id),
        FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
    )
""")

n.execute("""
    CREATE TABLE likes (
        like_id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        resource_id INTEGER NOT NULL,
        liked_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
    )
""")

n.execute("""
    CREATE TABLE comments (
        comment_id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        resource_id INTEGER NOT NULL,
        comment_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
    )
""")

n.execute("""
    CREATE TABLE followers (
        follower_id INTEGER NOT NULL,
        followed_id INTEGER NOT NULL,
        PRIMARY KEY (follower_id, followed_id),
        FOREIGN KEY (follower_id) REFERENCES users(user_id),
        FOREIGN KEY (followed_id) REFERENCES users(user_id)
    )
""")
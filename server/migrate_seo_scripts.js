
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPromise = open({
    filename: './server/database.sqlite',
    driver: sqlite3.Database
});

async function migrate() {
    const db = await dbPromise;
    console.log('Migrating SEO Settings Table...');
    try {
        await db.exec(`ALTER TABLE seo_settings ADD COLUMN head_scripts TEXT`);
        console.log('Column head_scripts added.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('Column head_scripts already exists.');
        } else {
            console.error(e);
        }
    }

    try {
        await db.exec(`ALTER TABLE seo_settings ADD COLUMN body_scripts TEXT`);
        console.log('Column body_scripts added.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('Column body_scripts already exists.');
        } else {
            console.error(e);
        }
    }
}

migrate();

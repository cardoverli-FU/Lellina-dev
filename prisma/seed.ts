// ════════════════════════════════════════════════════════════════════
//  Lellina — Seed Script (Portland, USA — V1 Launch Market)
//  Seeds: 6 Portland quadrants + 90 tribe tags
//         + admin (founder) + 8 demo profiles for discover verification
//  (TZ + ZA = Coming soon — code is generic, swap seed data to expand)
// ════════════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

// ─── 6 Portland Quadrants (V1 Launch Market — USA) ────────────────
// Zip codes will be added in a later phase. For now, quadrants only.
const DISTRICTS = [
  { name: 'Northwest Portland', region: 'Portland', country: 'US', areas: ['Pearl District', 'Nob Hill', 'Northwest'] },
  { name: 'Southwest Portland', region: 'Portland', country: 'US', areas: ['Downtown', 'Goose Hollow', 'Hillsdale'] },
  { name: 'Northeast Portland', region: 'Portland', country: 'US', areas: ['Alberta Arts', 'Irvington', 'Hollywood'] },
  { name: 'Southeast Portland', region: 'Portland', country: 'US', areas: ['Hawthorne', 'Richmond', 'Mt Tabor'] },
  { name: 'North Portland', region: 'Portland', country: 'US', areas: ['Kenton', 'St Johns', 'Mississippi'] },
  { name: 'South Portland', region: 'Portland', country: 'US', areas: ['Sellwood', 'Eastmoreland', 'Brooklyn'] },
]

// ─── Tribe Tags (30 identity + 30 subculture + 30 scene = 90 total) ─
const TRIBE_TAGS = [
  // ── Identity (30) ──
  { name: 'Lesbian', category: 'IDENTITY' },
  { name: 'Queer', category: 'IDENTITY' },
  { name: 'Bi', category: 'IDENTITY' },
  { name: 'Pan', category: 'IDENTITY' },
  { name: 'Demi', category: 'IDENTITY' },
  { name: 'Ace', category: 'IDENTITY' },
  { name: 'Fluid', category: 'IDENTITY' },
  { name: 'Questioning', category: 'IDENTITY' },
  { name: 'Sapphic', category: 'IDENTITY' },
  { name: 'Aro', category: 'IDENTITY' },
  { name: 'AroAce', category: 'IDENTITY' },
  { name: 'Gay', category: 'IDENTITY' },
  { name: 'Homoflexible', category: 'IDENTITY' },
  { name: 'Bicurious', category: 'IDENTITY' },
  { name: 'Omnisexual', category: 'IDENTITY' },
  { name: 'Abrosexual', category: 'IDENTITY' },
  { name: 'Polyamorous', category: 'IDENTITY' },
  { name: 'Grey-Ace', category: 'IDENTITY' },
  { name: 'Demiromantic', category: 'IDENTITY' },
  { name: 'Lesbian4Lesbian', category: 'IDENTITY' },
  { name: 'WLW', category: 'IDENTITY' },
  { name: 'Sapphic4Sapphic', category: 'IDENTITY' },
  { name: 'Two-Spirit', category: 'IDENTITY' },
  { name: 'Androsexual', category: 'IDENTITY' },
  { name: 'Gynesexual', category: 'IDENTITY' },
  { name: 'Finsexual', category: 'IDENTITY' },
  { name: 'Neptunic', category: 'IDENTITY' },
  { name: 'Uranic', category: 'IDENTITY' },
  { name: 'LGBTQ+', category: 'IDENTITY' },
  { name: 'Ally', category: 'IDENTITY' },

  // ── Subculture (30) ──
  { name: 'Stud', category: 'SUBCULTURE' },
  { name: 'Femme', category: 'SUBCULTURE' },
  { name: 'Butch', category: 'SUBCULTURE' },
  { name: 'Androgynous', category: 'SUBCULTURE' },
  { name: 'Soft Masc', category: 'SUBCULTURE' },
  { name: 'High Femme', category: 'SUBCULTURE' },
  { name: 'Tomboy', category: 'SUBCULTURE' },
  { name: 'Non-binary', category: 'SUBCULTURE' },
  { name: 'Chapstick', category: 'SUBCULTURE' },
  { name: 'Lipstick', category: 'SUBCULTURE' },
  { name: 'Stone Butch', category: 'SUBCULTURE' },
  { name: 'Stone Femme', category: 'SUBCULTURE' },
  { name: 'Soft Stud', category: 'SUBCULTURE' },
  { name: 'Ag', category: 'SUBCULTURE' },
  { name: 'Boi', category: 'SUBCULTURE' },
  { name: 'Stem', category: 'SUBCULTURE' },
  { name: 'Futch', category: 'SUBCULTURE' },
  { name: 'Dandy', category: 'SUBCULTURE' },
  { name: 'Genderqueer', category: 'SUBCULTURE' },
  { name: 'Genderfluid', category: 'SUBCULTURE' },
  { name: 'Demigirl', category: 'SUBCULTURE' },
  { name: 'Androgyne', category: 'SUBCULTURE' },
  { name: 'Masc of Center', category: 'SUBCULTURE' },
  { name: 'Femme of Center', category: 'SUBCULTURE' },
  { name: 'Power Femme', category: 'SUBCULTURE' },
  { name: 'Soft Butch', category: 'SUBCULTURE' },
  { name: 'Blue Jeans Femme', category: 'SUBCULTURE' },
  { name: 'Hasbian', category: 'SUBCULTURE' },
  { name: 'LUG', category: 'SUBCULTURE' },
  { name: 'Fluid Expression', category: 'SUBCULTURE' },

  // ── Scene (30) ──
  { name: 'Creative', category: 'SCENE' },
  { name: 'Foodie', category: 'SCENE' },
  { name: 'Hiker', category: 'SCENE' },
  { name: 'Beach Gal', category: 'SCENE' },
  { name: 'Night Owl', category: 'SCENE' },
  { name: 'Bookworm', category: 'SCENE' },
  { name: 'Music Lover', category: 'SCENE' },
  { name: 'Yogi', category: 'SCENE' },
  { name: 'Gamer', category: 'SCENE' },
  { name: 'Artist', category: 'SCENE' },
  { name: 'Entrepreneur', category: 'SCENE' },
  { name: 'Student', category: 'SCENE' },
  { name: 'Dog Mom', category: 'SCENE' },
  { name: 'Cat Mom', category: 'SCENE' },
  { name: 'Plant Parent', category: 'SCENE' },
  { name: 'Dancer', category: 'SCENE' },
  { name: 'Cinephile', category: 'SCENE' },
  { name: 'Climber', category: 'SCENE' },
  { name: 'Surfer', category: 'SCENE' },
  { name: 'Runner', category: 'SCENE' },
  { name: 'Cyclist', category: 'SCENE' },
  { name: 'Tattooed', category: 'SCENE' },
  { name: 'Crafter', category: 'SCENE' },
  { name: 'Wine Lover', category: 'SCENE' },
  { name: 'Coffee Addict', category: 'SCENE' },
  { name: 'Camping Gal', category: 'SCENE' },
  { name: 'Film Buff', category: 'SCENE' },
  { name: 'Poet', category: 'SCENE' },
  { name: 'Volunteer', category: 'SCENE' },
  { name: 'Traveler', category: 'SCENE' },
]

async function main() {
  console.log('🌱 Seeding Lellina database...\n')

  // ─── 1. Districts ─────────────────────────────────────────────
  await db.district.deleteMany({})

  console.log('📍 Seeding 6 Portland quadrants...')
  for (const d of DISTRICTS) {
    await db.district.upsert({
      where: { name: d.name },
      update: { region: d.region, country: d.country, areas: JSON.stringify(d.areas) },
      create: {
        name: d.name,
        region: d.region,
        country: d.country,
        areas: JSON.stringify(d.areas),
      },
    })
    console.log(`   ✅ ${d.name} (${d.region}, ${d.country}) — ${d.areas.length} areas`)
  }

  // ─── 2. Tribe Tags ────────────────────────────────────────────
  console.log('\n🏷️  Seeding tribe tags...')
  for (const t of TRIBE_TAGS) {
    await db.tribeTag.upsert({
      where: { name: t.name },
      update: {},
      create: { name: t.name, category: t.category },
    })
  }
  const identityCount = TRIBE_TAGS.filter(t => t.category === 'IDENTITY').length
  const subcultureCount = TRIBE_TAGS.filter(t => t.category === 'SUBCULTURE').length
  const sceneCount = TRIBE_TAGS.filter(t => t.category === 'SCENE').length
  console.log(`   ✅ ${TRIBE_TAGS.length} tags (${identityCount} identity, ${subcultureCount} subculture, ${sceneCount} scene)`)

  // ─── 3. Admin User (bypasses verification gate) ──────────────
  console.log('\n👤 Seeding admin user (cardoverli)...')
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'schedit.emails@gmail.com'

  if (!adminUsername || !adminPassword) {
    console.warn('   ⚠️  ADMIN_USERNAME / ADMIN_PASSWORD env vars not set — skipping admin seed.')
    console.warn('      Set them in Render dashboard to enable admin login.')
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    await db.user.upsert({
      where: { email: adminEmail },
      update: {
        username: adminUsername,
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
        verifiedAt: new Date(),
        country: 'US',
      },
      create: {
        email: adminEmail,
        username: adminUsername,
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
        verifiedAt: new Date(),
        country: 'US',
      },
    })
    console.log(`   ✅ Admin: ${adminUsername} / ${adminEmail} (role=ADMIN, isVerified=true, gate bypassed)`)
    console.log(`   Password: ${'*'.repeat(adminPassword.length)}`)
    console.log('   → /login (direct, no verification gate)')
    console.log('   → Login with username OR email. Forgot password sends to this email.')
  }

  // ─── 4. Founder Profile + Demo Profiles (Phase 4A) ────────────
  console.log('\n✨ Seeding founder + demo profiles...')

  const allDistricts = await db.district.findMany()
  const allTags = await db.tribeTag.findMany()
  const tagId = (name: string) => allTags.find((t) => t.name === name)?.id

  // Founder profile (for admin user — pinned first in discover)
  if (adminUsername && adminPassword) {
    const adminUser = await db.user.findUnique({ where: { email: adminEmail } })
    if (adminUser) {
      const nwPortland = allDistricts.find((d) => d.name === 'Northwest Portland')
      const founderTagIds = [tagId('Creative'), tagId('Entrepreneur'), tagId('Coffee Addict')].filter(Boolean) as string[]
      await db.profile.upsert({
        where: { userId: adminUser.id },
        update: {
          displayName: 'Lellina App Official',
          age: 28,
          bio: 'The official Lellina account. Built for us, by us. Find your people, gal.',
          districtId: nwPortland?.id,
          tribeTags: JSON.stringify(founderTagIds),
          isFounder: true,
          isOnline: true,
          lastActiveAt: new Date(),
          responseRateTier: 'FAST',
        },
        create: {
          userId: adminUser.id,
          displayName: 'Lellina App Official',
          age: 28,
          bio: 'The official Lellina account. Built for us, by us. Find your people, gal.',
          districtId: nwPortland?.id,
          tribeTags: JSON.stringify(founderTagIds),
          isFounder: true,
          isOnline: true,
          lastActiveAt: new Date(),
          responseRateTier: 'FAST',
        },
      })
      console.log('   ✅ Founder: Lellina App Official (US, Northwest Portland, isFounder=true)')
    }
  }

  // Demo profiles (for discover grid verification — NOT real users)
  const DEMO_PROFILES = [
    { country: 'US', email: 'demo.maya@lellina.seed', username: 'maya_pdx', displayName: 'Maya', age: 24, bio: 'Coffee, sunsets, and good vibes only. Pearl District is home.', district: 'Northwest Portland', tags: ['Femme', 'Creative', 'Coffee Addict'], isOnline: true, minsAgo: 5, tier: 'FAST' },
    { country: 'US', email: 'demo.jordan@lellina.seed', username: 'jordan_pdx', displayName: 'Jordan', age: 28, bio: 'Stud energy. Gym every morning. Looking for something real.', district: 'Southeast Portland', tags: ['Stud', 'Runner', 'Dog Mom'], isOnline: false, minsAgo: 180, tier: 'SLOW' },
    { country: 'US', email: 'demo.sage@lellina.seed', username: 'sage_pdx', displayName: 'Sage', age: 31, bio: 'Artist + plant mom. My studio is my happy place.', district: 'Northeast Portland', tags: ['Androgynous', 'Artist', 'Plant Parent'], isOnline: true, minsAgo: 15, tier: 'FAST' },
    { country: 'US', email: 'demo.riley@lellina.seed', username: 'riley_pdx', displayName: 'Riley', age: 22, bio: 'Just moved to Portland. Show me around?', district: 'North Portland', tags: ['Soft Masc', 'Cyclist', 'Tattooed'], isOnline: false, minsAgo: 1440, tier: null },
    { country: 'US', email: 'demo.kai@lellina.seed', username: 'kai_pdx', displayName: 'Kai', age: 26, bio: 'Musician + night owl. Find me at a show or a late-night diner.', district: 'Southwest Portland', tags: ['Boi', 'Music Lover', 'Night Owl'], isOnline: true, minsAgo: 30, tier: 'FAST' },
    { country: 'US', email: 'demo.zara@lellina.seed', username: 'zara_pdx', displayName: 'Zara', age: 25, bio: 'Foodie who hikes on weekends. Best of both worlds.', district: 'Southeast Portland', tags: ['Femme', 'Foodie', 'Hiker'], isOnline: true, minsAgo: 10, tier: 'FAST' },
    { country: 'US', email: 'demo.amara@lellina.seed', username: 'amara_pdx', displayName: 'Amara', age: 29, bio: 'Building something big. Wine nights are my therapy.', district: 'Northeast Portland', tags: ['Stem', 'Entrepreneur', 'Wine Lover'], isOnline: false, minsAgo: 300, tier: 'SLOW' },
    { country: 'US', email: 'demo.devon@lellina.seed', username: 'devon_pdx', displayName: 'Devon', age: 23, bio: 'Student by day, bookworm by night. Always at the coffee shop.', district: 'South Portland', tags: ['Soft Butch', 'Student', 'Bookworm'], isOnline: true, minsAgo: 2, tier: 'FAST' },
  ]

  for (const demo of DEMO_PROFILES) {
    const passwordHash = await bcrypt.hash('demo_no_login_123', 12)
    const user = await db.user.upsert({
      where: { email: demo.email },
      update: {
        username: demo.username,
        passwordHash,
        isVerified: true,
        country: demo.country,
      },
      create: {
        email: demo.email,
        username: demo.username,
        passwordHash,
        isVerified: true,
        verifiedAt: new Date(),
        role: 'USER',
        country: demo.country,
      },
    })

    const district = allDistricts.find((d) => d.name === demo.district)
    const tagIds = demo.tags.map(tagId).filter(Boolean) as string[]

    await db.profile.upsert({
      where: { userId: user.id },
      update: {
        displayName: demo.displayName,
        age: demo.age,
        bio: demo.bio,
        districtId: district?.id,
        tribeTags: JSON.stringify(tagIds),
        isOnline: demo.isOnline,
        lastActiveAt: new Date(Date.now() - demo.minsAgo * 60 * 1000),
        responseRateTier: demo.tier,
      },
      create: {
        userId: user.id,
        displayName: demo.displayName,
        age: demo.age,
        bio: demo.bio,
        districtId: district?.id,
        tribeTags: JSON.stringify(tagIds),
        isOnline: demo.isOnline,
        lastActiveAt: new Date(Date.now() - demo.minsAgo * 60 * 1000),
        responseRateTier: demo.tier,
      },
    })
    console.log(`   ✅ ${demo.displayName} (${demo.country}, ${demo.district})`)
  }

  console.log('\n✨ Seed complete!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

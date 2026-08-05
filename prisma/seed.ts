// ════════════════════════════════════════════════════════════════════
//  Lellina — Seed Script (Tanzania + Kenya — East Africa Launch)
//  Seeds: 31 TZ regions + 47 KE counties + 90 tribe tags
//         + admin (founder) + 10 demo profiles for discover verification
// ════════════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

// ─── 31 Tanzania Regions ────────────────────────────────────────────
const TANZANIA_REGIONS = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera',
  'Kaskazini Pemba', 'Kaskazini Unguja', 'Katavi', 'Kigoma', 'Kilimanjaro',
  'Kusini Pemba', 'Kusini Unguja', 'Lindi', 'Manyara', 'Mara', 'Mbeya',
  'Mjini Magharibi', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pwani',
  'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora',
  'Tanga',
]

// ─── 47 Kenya Counties ──────────────────────────────────────────────
const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale',
  'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru',
  'Migori', 'Mombasa', "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok',
  'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta',
  'Tana River', 'Tharaka-Nithi', 'Trans-Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot',
]

// ─── Districts (78 total: 31 TZ + 47 KE) ────────────────────────────
const DISTRICTS = [
  ...TANZANIA_REGIONS.map((name) => ({ name, region: 'TZ', country: 'Tanzania', areas: [] as string[] })),
  ...KENYA_COUNTIES.map((name) => ({ name, region: 'KE', country: 'Kenya', areas: [] as string[] })),
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

  console.log(`📍 Seeding ${DISTRICTS.length} districts (31 TZ regions + 47 KE counties)...`)
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
        country: 'TZ',
      },
      create: {
        email: adminEmail,
        username: adminUsername,
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
        verifiedAt: new Date(),
        country: 'TZ',
      },
    })
    console.log(`   ✅ Admin: ${adminUsername} / ${adminEmail} (role=ADMIN, isVerified=true, country=TZ, gate bypassed)`)
    console.log(`   Password: ${'*'.repeat(adminPassword.length)}`)
    console.log('   → /login (direct, no verification gate)')
    console.log('   → Login with username OR email. Forgot password sends to this email.')
  }

  // ─── 4. Founder Profile + Demo Profiles ──────────────────────
  console.log('\n✨ Seeding founder + demo profiles...')

  const allDistricts = await db.district.findMany()
  const allTags = await db.tribeTag.findMany()
  const tagId = (name: string) => allTags.find((t) => t.name === name)?.id

  // Founder profile (for admin user — pinned first in discover)
  if (adminUsername && adminPassword) {
    const adminUser = await db.user.findUnique({ where: { email: adminEmail } })
    if (adminUser) {
      const darEsSalaam = allDistricts.find((d) => d.name === 'Dar es Salaam')
      const founderTagIds = [tagId('Creative'), tagId('Entrepreneur'), tagId('Coffee Addict')].filter(Boolean) as string[]
      await db.profile.upsert({
        where: { userId: adminUser.id },
        update: {
          displayName: 'Lellina App Official',
          age: 28,
          bio: 'The official Lellina account. Built for us, by us. Find your people, gal.',
          districtId: darEsSalaam?.id,
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
          districtId: darEsSalaam?.id,
          tribeTags: JSON.stringify(founderTagIds),
          isFounder: true,
          isOnline: true,
          lastActiveAt: new Date(),
          responseRateTier: 'FAST',
        },
      })
      console.log('   ✅ Founder: Lellina App Official (TZ, Dar es Salaam, isFounder=true)')
    }
  }

  // Demo profiles (for discover grid verification — NOT real users)
  // 5 Tanzania + 5 Kenya with Swahili/East African names
  const DEMO_PROFILES = [
    // ── Tanzania (5) ──
    { country: 'TZ', email: 'demo.amina@lellina.seed', username: 'amina_dar', displayName: 'Amina', age: 24, bio: 'Karibu! Coffee lover and creative soul. Dar is where the heart is.', district: 'Dar es Salaam', tags: ['Femme', 'Creative', 'Coffee Addict'], isOnline: true, minsAgo: 5, tier: 'FAST' },
    { country: 'TZ', email: 'demo.zuwena@lellina.seed', username: 'zuwena_arusha', displayName: 'Zuwena', age: 27, bio: 'Safi! Hiker and nature enthusiast at the foot of Meru.', district: 'Arusha', tags: ['Stud', 'Hiker', 'Plant Parent'], isOnline: false, minsAgo: 180, tier: 'SLOW' },
    { country: 'TZ', email: 'demo.fatma@lellina.seed', username: 'fatma_mwanza', displayName: 'Fatma', age: 30, bio: 'Lake Victoria sunsets hit different. Music is my therapy, pole pole hatua hatua.', district: 'Mwanza', tags: ['Androgynous', 'Music Lover', 'Beach Gal'], isOnline: true, minsAgo: 15, tier: 'FAST' },
    { country: 'TZ', email: 'demo.neema@lellina.seed', username: 'neema_zanzibar', displayName: 'Neema', age: 25, bio: 'Kisiwa cha Unguja! Island girl with big dreams and a bigger heart.', district: 'Kaskazini Unguja', tags: ['Femme', 'Artist', 'Dancer'], isOnline: true, minsAgo: 30, tier: 'FAST' },
    { country: 'TZ', email: 'demo.saida@lellina.seed', username: 'saida_dodoma', displayName: 'Saida', age: 29, bio: 'Capital city energy. Entrepreneur building something beautiful — tujenge pamoja.', district: 'Dodoma', tags: ['Stem', 'Entrepreneur', 'Bookworm'], isOnline: false, minsAgo: 300, tier: 'SLOW' },

    // ── Kenya (5) ──
    { country: 'KE', email: 'demo.wanjiku@lellina.seed', username: 'wanjiku_nrb', displayName: 'Wanjiku', age: 23, bio: 'Nairobi nights and creative days. Looking for my person — pole pole hatua hatua.', district: 'Nairobi', tags: ['Soft Masc', 'Creative', 'Night Owl'], isOnline: true, minsAgo: 10, tier: 'FAST' },
    { country: 'KE', email: 'demo.achieng@lellina.seed', username: 'achieng_msa', displayName: 'Achieng', age: 26, bio: 'Coastal vibes in Mombasa! Saltwater and good company — that is all.', district: 'Mombasa', tags: ['Femme', 'Beach Gal', 'Foodie'], isOnline: true, minsAgo: 2, tier: 'FAST' },
    { country: 'KE', email: 'demo.njeri@lellina.seed', username: 'njeri_kisumu', displayName: 'Njeri', age: 28, bio: 'Lakeside living in Kisumu. Yogi by morning, poet by night.', district: 'Kisumu', tags: ['Butch', 'Yogi', 'Poet'], isOnline: false, minsAgo: 1440, tier: null },
    { country: 'KE', email: 'demo.akinyi@lellina.seed', username: 'akinyi_nakuru', displayName: 'Akinyi', age: 31, bio: 'Nakuru vibes! Runner and animal lover — karibu to my world.', district: 'Nakuru', tags: ['Tomboy', 'Runner', 'Dog Mom'], isOnline: true, minsAgo: 8, tier: 'FAST' },
    { country: 'KE', email: 'demo.muthoni@lellina.seed', username: 'muthoni_kiambu', displayName: 'Muthoni', age: 22, bio: 'Student in Kiambu. Books, chai, and big dreams — one step at a time.', district: 'Kiambu', tags: ['Soft Butch', 'Student', 'Bookworm'], isOnline: false, minsAgo: 420, tier: 'SLOW' },
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

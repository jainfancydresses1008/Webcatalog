import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.dressImage.deleteMany();
  await prisma.dressSize.deleteMany();
  await prisma.dress.deleteMany();
  const dresses = [
    { category:'Princess', characterName:'Elsa', description:'Frozen blue gown with silver snowflake design', images:['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop','https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop'], sizes:[{size:'S',price:1200},{size:'M',price:1400},{size:'L',price:1600}] },
    { category:'Superhero', characterName:'Spiderman', description:'Classic red and blue superhero costume', images:['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop'], sizes:[{size:'S',price:1500},{size:'M',price:1700},{size:'L',price:1900}] },
    { category:'Cartoon', characterName:'Mickey Mouse', description:'Fun cartoon party dress for kids', images:['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&auto=format&fit=crop','https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&auto=format&fit=crop'], sizes:[{size:'XS',price:900},{size:'S',price:1100},{size:'M',price:1300}] }
  ];
  for (const item of dresses) {
    await prisma.dress.create({ data: {
      category:item.category, characterName:item.characterName, description:item.description,
      sizes:{ create:item.sizes },
      images:{ create:item.images.map((url,index)=>({url, altText:`${item.characterName} image ${index+1}`, isMain:index===0, sortOrder:index})) }
    }});
  }
}
main().then(()=>prisma.$disconnect()).catch(async e=>{console.error(e); await prisma.$disconnect(); process.exit(1);});

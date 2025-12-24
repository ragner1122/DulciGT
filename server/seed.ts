import { db } from "./db";
import { questions, passages, tests } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check if already seeded
    const existingPassages = await db.select().from(passages);
    if (existingPassages.length > 0) {
      console.log("Database already seeded, skipping seed");
      return;
    }

    console.log("Starting database seed...");

    // READING PASSAGES (SHORT)
    const readingPassagesShort = [
      {
        title: "The History of Tea",
        content: `Tea is one of the most popular beverages in the world. The history of tea begins in ancient China, where it was first used as medicine around 2737 BCE. According to legend, the Chinese emperor Shen Nung discovered tea when leaves blew into a pot of boiling water. By the Tang Dynasty (618-907 CE), tea had become a daily drink for most people in China.

The popularity of tea spread along trade routes to the Middle East and eventually to Europe in the 17th century. Portuguese and Dutch traders brought tea to Europe, where it became fashionable among the wealthy. In Britain, tea became so popular that special tea ceremonies were developed, including the famous "afternoon tea" tradition.

Today, tea is consumed by over 3 billion people worldwide. Green tea, black tea, and oolong tea are the main varieties, each with their own unique flavors and health benefits. Tea farming has become a major industry in countries like China, India, Kenya, and Sri Lanka.`,
        section: "reading" as const,
        metadata: { topic: "history", difficulty: 2, language_level: "general" }
      },
      {
        title: "Working from Home",
        content: `The shift to working from home has become increasingly common in recent years, accelerated by global events and technological advances. Many companies discovered that remote work could be just as productive, if not more so, than office-based work. Employees often report greater satisfaction, better work-life balance, and fewer distractions when working from home.

However, remote work also presents challenges. Some workers struggle with isolation and the blurring of boundaries between work and personal life. Communication with colleagues can be more difficult, and building company culture becomes a greater challenge. Managers must adapt their leadership styles to effectively supervise remote teams.

Companies are now implementing hybrid models, where employees work from home some days and come to the office on others. This approach aims to combine the benefits of remote work with the social and collaborative benefits of office-based work. The future of work will likely continue to evolve as companies and workers discover what works best.`,
        section: "reading" as const,
        metadata: { topic: "work", difficulty: 2, language_level: "general" }
      },
      {
        title: "The Benefits of Exercise",
        content: `Regular physical exercise has numerous benefits for both physical and mental health. Exercise strengthens the heart, improves circulation, and helps maintain a healthy weight. Studies show that people who exercise regularly have lower rates of heart disease, diabetes, and certain cancers.

Beyond physical health, exercise is crucial for mental wellbeing. When we exercise, our bodies release endorphins, which are chemicals that improve mood and reduce stress. Regular exercise can help prevent depression and anxiety, and can improve sleep quality.

The recommended amount of exercise is at least 150 minutes of moderate-intensity aerobic activity per week, or 75 minutes of vigorous-intensity activity. This can include walking, running, cycling, swimming, or team sports. The key is to find activities you enjoy so you'll stick with them long-term.`,
        section: "reading" as const,
        metadata: { topic: "health", difficulty: 1, language_level: "general" }
      },
      {
        title: "Sustainable Fashion",
        content: `The fashion industry is one of the world's largest polluters, producing vast amounts of waste and consuming enormous quantities of resources. Sustainable fashion aims to address these issues by creating clothing in ways that are environmentally and socially responsible.

Sustainable fashion involves using eco-friendly materials, reducing waste in production, ensuring fair wages for workers, and creating clothing that lasts longer. Brands are increasingly using organic cotton, recycled materials, and alternative fibers like bamboo and hemp. Some companies are also exploring innovations like clothing that can be easily recycled or that uses minimal water in production.

Consumers can support sustainable fashion by buying less, choosing quality over quantity, and purchasing from brands committed to ethical practices. Vintage and secondhand shopping is another way to reduce environmental impact. As awareness grows, more companies are recognizing that sustainability is not just good for the planet, but also good for business.`,
        section: "reading" as const,
        metadata: { topic: "environment", difficulty: 2, language_level: "general" }
      },
      {
        title: "Digital Literacy in Schools",
        content: `In today's world, digital literacy has become as important as traditional reading and writing skills. Digital literacy includes the ability to use computers, understand information online, and navigate digital tools effectively. Schools around the world are increasingly incorporating digital literacy into their curricula.

Teaching digital literacy helps students develop critical thinking skills, as they learn to evaluate the credibility of online sources. It also prepares them for the modern workforce, where most jobs require some level of computer skills. Additionally, understanding how to stay safe online is crucial in preventing cyberbullying and protecting personal information.

However, there are concerns about screen time and the impact of technology on student development. Some educators argue that excessive use of digital devices can negatively affect concentration and face-to-face social skills. The challenge lies in finding the right balance between embracing technology and maintaining traditional learning methods.`,
        section: "reading" as const,
        metadata: { topic: "education", difficulty: 2, language_level: "general" }
      },
      {
        title: "Ocean Conservation",
        content: `The world's oceans cover 71% of the Earth's surface and contain 97% of the planet's water. These vast bodies of water are home to incredible biodiversity, with an estimated 200,000 known marine species, and possibly many more undiscovered. Oceans also play a crucial role in regulating the climate and providing food and livelihoods for billions of people.

However, ocean ecosystems face unprecedented threats. Overfishing has depleted many fish populations, plastic pollution kills marine animals, and climate change causes ocean acidification and rising temperatures. Coral reefs, which support about 25% of marine life, are dying at alarming rates due to warming waters.

Ocean conservation efforts include establishing marine protected areas, implementing fishing restrictions, and reducing plastic consumption. International cooperation is essential, as ocean pollution and overfishing are global problems. Individuals can contribute by reducing their plastic use, supporting sustainable fishing practices, and supporting conservation organizations.`,
        section: "reading" as const,
        metadata: { topic: "environment", difficulty: 3, language_level: "general" }
      },
      {
        title: "Time Management Tips",
        content: `Effective time management is a skill that can greatly improve productivity and reduce stress. One of the most important techniques is prioritization: identifying which tasks are most important and giving them your attention first. Many people find it helpful to create a to-do list each day and number items by priority.

Breaking large tasks into smaller, manageable steps can make them feel less overwhelming. Setting specific deadlines for each step helps maintain momentum and ensures the overall project stays on track. Regular breaks are also important; studies show that taking short breaks actually improves focus and productivity.

Some popular time management methods include the Pomodoro Technique, which involves working in 25-minute intervals with short breaks in between. Another approach is time blocking, where you schedule specific times for different types of tasks. The key is to find a system that works for you and practice it consistently.`,
        section: "reading" as const,
        metadata: { topic: "productivity", difficulty: 2, language_level: "general" }
      },
      {
        title: "The Psychology of Colors",
        content: `Colors have a profound effect on our emotions and behavior, though these effects can vary across different cultures. Red is often associated with passion and energy, but also danger or warning. Blue typically evokes feelings of calm and stability. Green is often linked to nature and growth. Yellow is associated with happiness and optimism.

Understanding color psychology is valuable in many fields. In marketing and branding, companies use colors strategically to influence consumer behavior. In interior design, colors are chosen to create specific moods and atmospheres. In education, color-coded materials can help with learning and memory retention.

It's important to note that color preferences and associations are not universal. Cultural differences, personal experiences, and individual preferences all influence how we respond to colors. What may feel calming to one person might feel depressing to another. This is why effective use of color requires considering the context and audience.`,
        section: "reading" as const,
        metadata: { topic: "psychology", difficulty: 2, language_level: "general" }
      },
      {
        title: "Pet Adoption Benefits",
        content: `Adopting a pet from a shelter or rescue organization comes with numerous benefits. Shelter animals are often already housetrained and may have behavioral assessment information available. Adoption is also much more affordable than buying a pet from a breeder. Most importantly, adoption saves lives and makes space for other animals in need.

Pets provide significant health and emotional benefits to their owners. Studies show that pet owners have lower blood pressure and reduced stress levels. Dogs encourage their owners to exercise through regular walks, while cats provide companionship and comfort. Pets can also help reduce feelings of loneliness, especially for elderly individuals and those living alone.

Beyond the individual benefits, adopting from shelters supports these vital organizations and helps combat unethical breeding practices. Shelter staff can help match you with a pet that fits your lifestyle and living situation, increasing the chances of a successful, long-term placement.`,
        section: "reading" as const,
        metadata: { topic: "animals", difficulty: 1, language_level: "general" }
      }
    ];

    // Insert short passages
    const insertedShortPassages = await db.insert(passages).values(readingPassagesShort).returning();
    console.log(`Inserted ${insertedShortPassages.length} short reading passages`);

    // READING QUESTIONS (Multiple choice, True/False/Not Given, Short Answer)
    const readingQuestions = [
      {
        section: "reading" as const,
        part: 1,
        type: "multiple_choice" as const,
        content: "According to the passage, when was tea first used in China?",
        options: { a: "618 CE", b: "907 CE", c: "Around 2737 BCE", d: "17th century" },
        correctAnswer: "c",
        explanation: "The passage states 'it was first used as medicine around 2737 BCE.' This makes it clear that tea was used in ancient China around 2737 BCE.",
        passageId: insertedShortPassages[0].id,
        difficulty: 1,
        tags: ["reading", "comprehension", "detail"]
      },
      {
        section: "reading" as const,
        part: 1,
        type: "true_false_not_given" as const,
        content: "Tea was brought to Europe by Portuguese and Dutch traders.",
        options: null,
        correctAnswer: "true",
        explanation: "The passage explicitly states: 'Portuguese and Dutch traders brought tea to Europe, where it became fashionable among the wealthy.'",
        passageId: insertedShortPassages[0].id,
        difficulty: 1,
        tags: ["reading", "fact", "detail"]
      },
      {
        section: "reading" as const,
        part: 1,
        type: "short_answer" as const,
        content: "Name two countries where tea farming has become a major industry.",
        options: null,
        correctAnswer: "China|India|Kenya|Sri Lanka",
        explanation: "The passage mentions: 'Tea farming has become a major industry in countries like China, India, Kenya, and Sri Lanka.'",
        passageId: insertedShortPassages[0].id,
        difficulty: 2,
        tags: ["reading", "extraction", "detail"]
      },
      {
        section: "reading" as const,
        part: 1,
        type: "multiple_choice" as const,
        content: "What is a main challenge of working from home mentioned in the passage?",
        options: { a: "It's always less productive than office work", b: "Workers struggle with isolation", c: "It's too expensive for companies", d: "Employees never take breaks" },
        correctAnswer: "b",
        explanation: "The passage states: 'Some workers struggle with isolation and the blurring of boundaries between work and personal life.'",
        passageId: insertedShortPassages[1].id,
        difficulty: 1,
        tags: ["reading", "comprehension", "inference"]
      },
      {
        section: "reading" as const,
        part: 1,
        type: "true_false_not_given" as const,
        content: "Hybrid work models combine office and remote work.",
        options: null,
        correctAnswer: "true",
        explanation: "The passage clearly states: 'Companies are now implementing hybrid models, where employees work from home some days and come to the office on others.'",
        passageId: insertedShortPassages[1].id,
        difficulty: 1,
        tags: ["reading", "fact"]
      },
      {
        section: "reading" as const,
        part: 1,
        type: "multiple_choice" as const,
        content: "According to the passage, what do endorphins do?",
        options: { a: "They strengthen the heart", b: "They improve mood and reduce stress", c: "They help maintain weight", d: "They improve circulation" },
        correctAnswer: "b",
        explanation: "The passage states: 'When we exercise, our bodies release endorphins, which are chemicals that improve mood and reduce stress.'",
        passageId: insertedShortPassages[2].id,
        difficulty: 1,
        tags: ["reading", "detail", "science"]
      },
      {
        section: "reading" as const,
        part: 1,
        type: "true_false_not_given" as const,
        content: "The recommended exercise is 150 minutes of vigorous-intensity activity per week.",
        options: null,
        correctAnswer: "false",
        explanation: "The passage states: 'at least 150 minutes of moderate-intensity aerobic activity per week, or 75 minutes of vigorous-intensity activity.' So 150 minutes would be moderate, not vigorous.",
        passageId: insertedShortPassages[2].id,
        difficulty: 2,
        tags: ["reading", "detail", "fact"]
      },
      {
        section: "reading" as const,
        part: 1,
        type: "short_answer" as const,
        content: "What are three ways mentioned to support sustainable fashion?",
        options: null,
        correctAnswer: "buying less|quality over quantity|secondhand shopping",
        explanation: "The passage mentions: 'Consumers can support sustainable fashion by buying less, choosing quality over quantity, and purchasing from brands committed to ethical practices. Vintage and secondhand shopping is another way...'",
        passageId: insertedShortPassages[3].id,
        difficulty: 2,
        tags: ["reading", "extraction", "detail"]
      },
      {
        section: "reading" as const,
        part: 1,
        type: "multiple_choice" as const,
        content: "What concern do some educators have about digital literacy?",
        options: { a: "Students don't need it", b: "Excessive screen time can affect concentration", c: "It's too expensive", d: "Only children should learn it" },
        correctAnswer: "b",
        explanation: "The passage states: 'Some educators argue that excessive use of digital devices can negatively affect concentration and face-to-face social skills.'",
        passageId: insertedShortPassages[4].id,
        difficulty: 2,
        tags: ["reading", "comprehension", "concern"]
      },
      {
        section: "reading" as const,
        part: 1,
        type: "true_false_not_given" as const,
        content: "All marine species have been discovered by scientists.",
        options: null,
        correctAnswer: "false",
        explanation: "The passage states: 'with an estimated 200,000 known marine species, and possibly many more undiscovered.' This indicates not all have been discovered.",
        passageId: insertedShortPassages[5].id,
        difficulty: 2,
        tags: ["reading", "fact", "inference"]
      }
    ];

    const insertedReadingQuestions = await db.insert(questions).values(readingQuestions).returning();
    console.log(`Inserted ${insertedReadingQuestions.length} reading questions`);

    // WRITING TASK 1 (Letter) Prompts
    const writingLetterQuestions = [
      {
        section: "writing" as const,
        part: 1,
        type: "letter" as const,
        content: `You recently stayed in a hotel for business. However, when you received your bill, you noticed several charges that you did not incur. Write a letter to the hotel manager complaining about the bill and requesting a corrected invoice. In your letter, you should:
• Explain which charges you dispute
• Say how this has affected you
• Suggest what you would like the hotel to do

Write at least 150 words.`,
        options: null,
        correctAnswer: null,
        explanation: "This is a writing task that requires personal response. Assessment is based on Task Achievement, Coherence/Cohesion, Lexical Resource, and Grammar.",
        difficulty: 2,
        tags: ["writing", "letter", "complaint"]
      },
      {
        section: "writing" as const,
        part: 1,
        type: "letter" as const,
        content: `A friend you made while traveling has written to ask you to visit them. However, you cannot go. Write a letter to your friend:
• Explaining why you cannot visit
• Suggesting an alternative time
• Suggesting another way you could stay in touch

Write at least 150 words.`,
        options: null,
        correctAnswer: null,
        explanation: "This is a writing task requiring polite refusal and alternative suggestions.",
        difficulty: 1,
        tags: ["writing", "letter", "personal"]
      },
      {
        section: "writing" as const,
        part: 1,
        type: "letter" as const,
        content: `You recently missed an important event due to a misunderstanding about the date and time. Write a letter to the event organizer:
• Apologizing for not attending
• Explaining what happened
• Asking if there will be another opportunity to attend

Write at least 150 words.`,
        options: null,
        correctAnswer: null,
        explanation: "This writing task requires an apology and request for information.",
        difficulty: 1,
        tags: ["writing", "letter", "apology"]
      }
    ];

    const insertedLetterQuestions = await db.insert(questions).values(writingLetterQuestions).returning();
    console.log(`Inserted ${insertedLetterQuestions.length} writing letter prompts`);

    // WRITING TASK 2 (Essay) Prompts
    const writingEssayQuestions = [
      {
        section: "writing" as const,
        part: 2,
        type: "essay" as const,
        content: `Some people think that the government should ban fast food as it is harmful to health. Others believe that this is an infringement on personal freedom. Discuss both these views and give your own opinion.

Write at least 250 words.`,
        options: null,
        correctAnswer: null,
        explanation: "This is a discussion essay requiring balanced presentation of both views and personal opinion.",
        difficulty: 3,
        tags: ["writing", "essay", "discussion"]
      },
      {
        section: "writing" as const,
        part: 2,
        type: "essay" as const,
        content: `Advances in technology are having an increasingly negative effect on human relationships and social interaction. To what extent do you agree or disagree with this statement?

Write at least 250 words.`,
        options: null,
        correctAnswer: null,
        explanation: "This is an opinion essay requiring agreement/disagreement with an assertion.",
        difficulty: 3,
        tags: ["writing", "essay", "opinion"]
      },
      {
        section: "writing" as const,
        part: 2,
        type: "essay" as const,
        content: `Some argue that the best way to improve public health is to increase the price of unhealthy foods. Others say education is more important. Discuss both views and state which you think is more effective.

Write at least 250 words.`,
        options: null,
        correctAnswer: null,
        explanation: "This essay requires discussion of two approaches with evaluation.",
        difficulty: 2,
        tags: ["writing", "essay", "health", "policy"]
      }
    ];

    const insertedEssayQuestions = await db.insert(questions).values(writingEssayQuestions).returning();
    console.log(`Inserted ${insertedEssayQuestions.length} writing essay prompts`);

    // SPEAKING Prompts
    const speakingQuestions = [
      {
        section: "speaking" as const,
        part: 1,
        type: "speaking_part_1" as const,
        content: `Let's talk about your hometown. 
• What is your hometown like? 
• How long have you lived there? 
• What do you like about it? 
• Is there anything you dislike about it?`,
        options: null,
        correctAnswer: null,
        explanation: "Part 1 of the Speaking test focuses on familiar topics from personal experience.",
        difficulty: 1,
        tags: ["speaking", "part1", "personal"]
      },
      {
        section: "speaking" as const,
        part: 2,
        type: "speaking_part_2" as const,
        content: `Describe a place you would like to visit.

You should say:
• where this place is
• why you would like to visit it
• what you would do there
and explain why this place is interesting to you.

You will have one minute to prepare and then about two minutes to talk.`,
        options: null,
        correctAnswer: null,
        explanation: "Part 2 requires a longer monologue on a given topic with preparation time.",
        difficulty: 2,
        tags: ["speaking", "part2", "description"]
      },
      {
        section: "speaking" as const,
        part: 3,
        type: "speaking_part_3" as const,
        content: `Let's discuss travel and tourism more generally.
• How has tourism changed in recent years?
• What are the positive and negative impacts of tourism?
• How do you think tourism will develop in the future?
• What can be done to make tourism more sustainable?`,
        options: null,
        correctAnswer: null,
        explanation: "Part 3 requires discussion of abstract topics and expressing opinions.",
        difficulty: 3,
        tags: ["speaking", "part3", "discussion"]
      }
    ];

    const insertedSpeakingQuestions = await db.insert(questions).values(speakingQuestions).returning();
    console.log(`Inserted ${insertedSpeakingQuestions.length} speaking prompts`);

    // LISTENING Questions (based on short passages)
    const listeningQuestions = [
      {
        section: "listening" as const,
        part: 1,
        type: "multiple_choice" as const,
        content: "What time does the museum open on weekdays?",
        options: { a: "8:00 AM", b: "9:00 AM", c: "10:00 AM", d: "11:00 AM" },
        correctAnswer: "b",
        explanation: "In the recording, the speaker states 'We are open at 9 in the morning on weekdays.'",
        difficulty: 1,
        tags: ["listening", "detail", "schedule"]
      },
      {
        section: "listening" as const,
        part: 1,
        type: "short_answer" as const,
        content: "How much does it cost to book a private tour?",
        options: null,
        correctAnswer: "£50|50 pounds",
        explanation: "The speaker mentions: 'Private tours are available at £50 per group.'",
        difficulty: 1,
        tags: ["listening", "detail", "cost"]
      },
      {
        section: "listening" as const,
        part: 2,
        type: "true_false_not_given" as const,
        content: "Lunch is provided during the day tour.",
        options: null,
        correctAnswer: "not given",
        explanation: "The passage does not mention whether lunch is provided during tours.",
        difficulty: 2,
        tags: ["listening", "inference"]
      }
    ];

    const insertedListeningQuestions = await db.insert(questions).values(listeningQuestions).returning();
    console.log(`Inserted ${insertedListeningQuestions.length} listening questions`);

    // Create comprehensive tests
    const comprehensiveTest = await db.insert(tests).values({
      title: "IELTS GT Full Mock Test 1",
      structure: {
        sections: [
          {
            name: "Listening",
            part: 1,
            questionCount: 1,
            duration: 30,
            questionIds: [insertedListeningQuestions[0].id, insertedListeningQuestions[1].id]
          },
          {
            name: "Reading",
            part: 1,
            questionCount: 8,
            duration: 60,
            questionIds: insertedReadingQuestions.slice(0, 8).map(q => q.id)
          },
          {
            name: "Writing",
            tasks: [
              { task: "Task 1 (Letter)", questionId: insertedLetterQuestions[0].id, duration: 20 },
              { task: "Task 2 (Essay)", questionId: insertedEssayQuestions[0].id, duration: 40 }
            ]
          },
          {
            name: "Speaking",
            parts: [
              { part: 1, questionId: insertedSpeakingQuestions[0].id, duration: 4 },
              { part: 2, questionId: insertedSpeakingQuestions[1].id, duration: 8 },
              { part: 3, questionId: insertedSpeakingQuestions[2].id, duration: 5 }
            ]
          }
        ]
      },
      isSystem: true
    }).returning();

    console.log(`Created comprehensive test: ${comprehensiveTest[0].title}`);

    // Create focused practice tests
    const readingTest = await db.insert(tests).values({
      title: "Reading Practice Test 1",
      structure: {
        sections: [
          {
            name: "Reading",
            questionCount: 5,
            duration: 20,
            questionIds: insertedReadingQuestions.slice(0, 5).map(q => q.id)
          }
        ]
      },
      isSystem: true
    }).returning();

    const writingTest = await db.insert(tests).values({
      title: "Writing Practice Test 1",
      structure: {
        sections: [
          {
            name: "Writing",
            tasks: [
              { task: "Task 1", questionId: insertedLetterQuestions[1].id, duration: 20 },
              { task: "Task 2", questionId: insertedEssayQuestions[1].id, duration: 40 }
            ]
          }
        ]
      },
      isSystem: true
    }).returning();

    const speakingTest = await db.insert(tests).values({
      title: "Speaking Practice Test 1",
      structure: {
        sections: [
          {
            name: "Speaking",
            parts: [
              { part: 1, questionId: insertedSpeakingQuestions[0].id, duration: 4 },
              { part: 2, questionId: insertedSpeakingQuestions[1].id, duration: 8 }
            ]
          }
        ]
      },
      isSystem: true
    }).returning();

    console.log("Successfully created 4 tests");
    console.log(`
    ✓ Seeding completed successfully!
    - Passages: ${insertedShortPassages.length}
    - Reading Questions: ${insertedReadingQuestions.length}
    - Writing Letter Prompts: ${insertedLetterQuestions.length}
    - Writing Essay Prompts: ${insertedEssayQuestions.length}
    - Speaking Prompts: ${insertedSpeakingQuestions.length}
    - Listening Questions: ${insertedListeningQuestions.length}
    - Tests: 4 (1 full mock + 3 focused practice)
    `);

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

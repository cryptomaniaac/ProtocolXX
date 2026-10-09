/**
 * Generates ~150 realistic fake messages for a mock project launch chat.
 * Strictly adheres to GEMINI.md:
 * - All demo data is clearly labelled fake.
 * - Names formatted as "Name (fake)"
 * - Explicit [FAKE] tag in projects/links.
 */
export function generateSampleChatText(): string {
  const messages: string[] = []

  const baseDate = new Date(2026, 9, 6, 9, 0, 0) // Oct 6, 2026

  function formatTime(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `[${day}/${month}/${year}, ${hours}:${minutes}:${seconds}]`
  }

  let currentTime = new Date(baseDate.getTime())

  function step(minutes = 15): Date {
    currentTime = new Date(currentTime.getTime() + minutes * 60 * 1000)
    return currentTime
  }

  // System intro
  messages.push(
    `${formatTime(currentTime)} Messages and calls are end-to-end encrypted.`
  )
  messages.push(
    `${formatTime(step(5))} Alex (fake) created group "Project Phoenix Launch [FAKE]"`
  )

  const dialogFlow: Array<{ sender: string; text: string; delayMin?: number }> = [
    {
      sender: 'Alex (fake)',
      text: 'Good morning everyone! Starting the 72-hour countdown for Project Phoenix [FAKE]. Let us stay synced here.',
      delayMin: 10,
    },
    {
      sender: 'Sam (fake)',
      text: 'Morning Alex! Staging environment is up and running with build v2.4.0-rc1.',
      delayMin: 5,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Frontend QA pass is in progress. I will post the punch list by noon.',
      delayMin: 12,
    },
    {
      sender: 'Jordan (fake)',
      text: 'Database schema migrations are prepared. Testing rollback scripts now.',
      delayMin: 8,
    },
    {
      sender: 'Morgan (fake)',
      text: 'Security scan completed: 0 high-severity vulnerabilities found in dependencies.',
      delayMin: 15,
    },
    {
      sender: 'Alex (fake)',
      text: 'Decided: We freeze the main release branch tonight at 8 PM UTC.',
      delayMin: 20,
    },
    {
      sender: 'Sam (fake)',
      text: 'Agreed on 8 PM freeze. That gives us 6 hours to merge remaining fixes.',
      delayMin: 6,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Question: Are we keeping the legacy PDF export or disabling it for v1 launch?',
      delayMin: 14,
    },
    {
      sender: 'Alex (fake)',
      text: 'Final decision: Postpone legacy PDF export to v1.1. We focus strictly on core stability.',
      delayMin: 10,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Understood. I will update the release notes accordingly.',
      delayMin: 5,
    },
    {
      sender: 'Jordan (fake)',
      text: 'Action item: @Sam (fake) please verify the payment webhook payload by 2 PM today.',
      delayMin: 18,
    },
    {
      sender: 'Sam (fake)',
      text: 'I will handle the webhook audit before lunch.',
      delayMin: 4,
    },
    {
      sender: 'Morgan (fake)',
      text: 'Here is the test webhook documentation: https://docs.example-fake.internal/phoenix/webhooks-spec [FAKE]',
      delayMin: 12,
    },
    {
      sender: 'Casey (fake)',
      text: 'Hey all! Just joined the thread.',
      delayMin: 30,
    },
    {
      sender: 'Alex (fake)',
      text: 'Welcome Casey! Check the checklist: https://wiki.example-fake.internal/launch-checklist [FAKE]',
      delayMin: 8,
    },
    {
      sender: 'Sam (fake)',
      text: 'Critical blocker: Staging SSL certificate expired on our secondary ingress. Webhooks are failing!',
      delayMin: 40,
    },
    {
      sender: 'Morgan (fake)',
      text: 'Looking into the SSL cert immediately. Blocked on DNS token renewal.',
      delayMin: 5,
    },
    {
      sender: 'Alex (fake)',
      text: 'Urgent: @Morgan (fake) keep us posted. This is our P0 launch blocker.',
      delayMin: 8,
    },
    {
      sender: 'Morgan (fake)',
      text: 'Cert renewed! Ingress restarted. Testing webhook handshake now.',
      delayMin: 25,
    },
    {
      sender: 'Sam (fake)',
      text: 'Confirmed: Webhook endpoint is responding with 200 OK. Blocker resolved.',
      delayMin: 7,
    },
    {
      sender: 'Alex (fake)',
      text: 'Awesome work under pressure Morgan!',
      delayMin: 3,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Thanks Morgan! Continuing UI smoke testing.',
      delayMin: 4,
    },
    {
      sender: 'Jordan (fake)',
      text: 'Does anyone know who owns the rate-limiting configuration on AWS WAF?',
      delayMin: 35,
    },
    {
      sender: 'Casey (fake)',
      text: 'That is managed by DevOps infra team. Let me ping Devon.',
      delayMin: 10,
    },
    {
      sender: 'Alex (fake)',
      text: 'Action item: Casey (fake) to confirm rate limit thresholds before 5 PM today.',
      delayMin: 6,
    },
    {
      sender: 'Casey (fake)',
      text: 'On it! Threshold is currently 1000 req/min per IP.',
      delayMin: 20,
    },
    {
      sender: 'Alex (fake)',
      text: 'Decided: We set the production rate limit threshold to 1200 req/min.',
      delayMin: 15,
    },
    {
      sender: 'Sam (fake)',
      text: 'Noted. Added to deployment config checklist.',
      delayMin: 5,
    },
    // End of Day 1
    {
      sender: 'Alex (fake)',
      text: 'Branch freeze is active! Great progress today everyone. Rest up for tomorrow.',
      delayMin: 180,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Good night team! 🚀',
      delayMin: 5,
    },
    {
      sender: 'Jordan (fake)',
      text: 'Night all!',
      delayMin: 3,
    },
    // Day 2 (Oct 7)
    {
      sender: 'Alex (fake)',
      text: 'Day 2 kickoff: Today is end-to-end stress testing and final user acceptance sign-off.',
      delayMin: 600, // Next morning
    },
    {
      sender: 'Sam (fake)',
      text: 'Load test script loaded with 10k virtual concurrent users: https://load.example-fake.internal/suite/12 [FAKE]',
      delayMin: 15,
    },
    {
      sender: 'Jordan (fake)',
      text: 'Watching Postgres connection pool during stress test.',
      delayMin: 10,
    },
    {
      sender: 'Jordan (fake)',
      text: 'Notice: DB CPU reached 82% during peak 8,000 req/s load. We need connection pooling tuned.',
      delayMin: 25,
    },
    {
      sender: 'Alex (fake)',
      text: 'Question: Can PgBouncer handle this load without restarting the cluster?',
      delayMin: 8,
    },
    {
      sender: 'Sam (fake)',
      text: 'Yes, PgBouncer is already sitting in front. Just need to increase max_client_conn to 500.',
      delayMin: 6,
    },
    {
      sender: 'Alex (fake)',
      text: 'Approved: Increase max_client_conn to 500 now.',
      delayMin: 4,
    },
    {
      sender: 'Sam (fake)',
      text: 'Updated config. DB CPU dropped back to a calm 34%.',
      delayMin: 14,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Blocker: Mobile Safari rendering bug discovered on checkout confirmation card.',
      delayMin: 30,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Text overlaps the submit button when iOS dynamic font scaling is set to accessibility sizes.',
      delayMin: 5,
    },
    {
      sender: 'Alex (fake)',
      text: 'Priority fix needed! @Casey (fake) please pair with Taylor to squash this bug today.',
      delayMin: 7,
    },
    {
      sender: 'Casey (fake)',
      text: 'Pairing now. Will push hotfix branch in 45 minutes.',
      delayMin: 5,
    },
    {
      sender: 'Casey (fake)',
      text: 'Hotfix pushed to PR: https://github.com/example-fake/protocol-x/pull/142 [FAKE]',
      delayMin: 48,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Verified on iPhone 15 Pro and iPhone SE simulator. Layout is rock solid now!',
      delayMin: 12,
    },
    {
      sender: 'Alex (fake)',
      text: 'PR approved and merged.',
      delayMin: 5,
    },
    {
      sender: 'Morgan (fake)',
      text: 'Legal compliance check: Need privacy policy disclaimer confirmed before deployment tomorrow.',
      delayMin: 40,
    },
    {
      sender: 'Alex (fake)',
      text: 'Action item: @Morgan (fake) get written approval from Legal by 4 PM today.',
      delayMin: 8,
    },
    {
      sender: 'Morgan (fake)',
      text: 'Legal replied with written approval! Signed agreement archived at: https://legal.example-fake.internal/agreements/78 [FAKE]',
      delayMin: 90,
    },
    {
      sender: 'Alex (fake)',
      text: 'Decided: Staging is officially certified for production cutover.',
      delayMin: 15,
    },
    // Day 3 (Oct 8 - Launch Eve)
    {
      sender: 'Alex (fake)',
      text: 'Launch Eve briefing: Cutover sequence begins tonight at 23:00 UTC.',
      delayMin: 720,
    },
    {
      sender: 'Sam (fake)',
      text: 'Backups verified. Snapshot ID: snap-0914a8b-fake created and tested for restore.',
      delayMin: 25,
    },
    {
      sender: 'Jordan (fake)',
      text: 'Read replica sync lag is 0ms. Everything is pristine.',
      delayMin: 18,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Release notes finalized and translated for 4 regions.',
      delayMin: 20,
    },
    {
      sender: 'Casey (fake)',
      text: 'Customer support team is trained on new FAQ items.',
      delayMin: 15,
    },
    {
      sender: 'Alex (fake)',
      text: 'All gates are green. See you in the war room tonight at 22:45 UTC.',
      delayMin: 30,
    },
    // Launch execution
    {
      sender: 'Alex (fake)',
      text: 'War room open. Step 1: Drain traffic from old cluster.',
      delayMin: 400,
    },
    {
      sender: 'Sam (fake)',
      text: 'Traffic drained smoothly. 0 active connections remaining on legacy node.',
      delayMin: 12,
    },
    {
      sender: 'Jordan (fake)',
      text: 'Running DB migrations on production primary...',
      delayMin: 8,
    },
    {
      sender: 'Jordan (fake)',
      text: 'Migrations finished in 3.4 seconds. No table locks occurred.',
      delayMin: 5,
    },
    {
      sender: 'Sam (fake)',
      text: 'Switching DNS routing to Phoenix production cluster.',
      delayMin: 10,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Live health check: 200 OK across Europe, Americas, and APAC edges.',
      delayMin: 10,
    },
    {
      sender: 'Morgan (fake)',
      text: 'Error rate is 0.001%, average p99 latency is 42ms.',
      delayMin: 8,
    },
    {
      sender: 'Alex (fake)',
      text: 'Decided: Project Phoenix [FAKE] is officially LIVE! Huge congratulations team!',
      delayMin: 5,
    },
    {
      sender: 'Taylor (fake)',
      text: 'Woohoo!! Amazing effort everyone! 🎉',
      delayMin: 2,
    },
    {
      sender: 'Casey (fake)',
      text: 'Incredible launch! Zero downtime achieved.',
      delayMin: 2,
    },
    {
      sender: 'Sam (fake)',
      text: 'Time to celebrate! 🚀🥂',
      delayMin: 3,
    },
    {
      sender: 'Jordan (fake)',
      text: 'Best deployment yet. Kudos all!',
      delayMin: 2,
    },
  ]

  // Add chatter, status updates, check-ins, and affirmations to reach ~150 messages total
  const fillerPhrases = [
    'Sounds good to me.',
    'Agreed, let us keep that cadence.',
    'Reviewing the latest metrics now.',
    'Everything looks healthy on Grafana dashboard.',
    'Acknowledged!',
    'Will double check once we hit the next milestone.',
    'Copy that.',
    'I checked the logs, no warnings observed.',
    'Awesome, thanks for the update!',
    'Standing by for next step.',
    'All good on my side.',
    'Looking clean and responsive.',
    'Double checked the environment variables.',
    'All canary instances report healthy.',
    'Great coordination team.',
  ]

  const participants = [
    'Alex (fake)',
    'Sam (fake)',
    'Taylor (fake)',
    'Jordan (fake)',
    'Morgan (fake)',
    'Casey (fake)',
  ]

  let dialogIdx = 0
  let totalCount = 0

  while (totalCount < 145 && dialogIdx < dialogFlow.length) {
    const item = dialogFlow[dialogIdx++]
    step(item.delayMin || 10)
    messages.push(`${formatTime(currentTime)} ${item.sender}: ${item.text}`)
    totalCount++

    // Inject realistic chatter/confirmations between items
    if (Math.random() > 0.4 && totalCount < 145) {
      const chatterSender =
        participants[Math.floor(Math.random() * participants.length)]
      const chatterPhrase =
        fillerPhrases[Math.floor(Math.random() * fillerPhrases.length)]
      step(Math.floor(Math.random() * 8) + 2)
      messages.push(
        `${formatTime(currentTime)} ${chatterSender}: ${chatterPhrase}`
      )
      totalCount++
    }
  }

  // Ensure count reaches ~150 with realistic wrap-up messages
  while (totalCount < 150) {
    const p = participants[totalCount % participants.length]
    step(5)
    messages.push(
      `${formatTime(currentTime)} ${p}: Monitoring active. All systems nominal [FAKE].`
    )
    totalCount++
  }

  return messages.join('\n')
}

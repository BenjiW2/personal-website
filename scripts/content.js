export const siteMeta = {
  name: "Benji Warburton",
  shortRole: "EE / CS at Stanford",
  longRole: "Engineering systems across robotics, software, and the physical world.",
  intro:
    "I build tools, hardware, and evaluation loops that make robotics work feel more measurable and less mysterious.",
  summary:
    "The center of gravity is robotics, systems, and machine learning, but the through line is broader: I like projects where software has to answer to real constraints in the physical world.",
  location: "Palo Alto, California",
  workplace: "Stanford ARMLab",
  availability: "Open to robotics, systems, and ML internships",
  email: "mailto:hello@benjiwarburton.com",
  footerNote: "Built as a static multipage site with shared data and components.",
  heroFacts: [
    {
      label: "Based in",
      value: "Palo Alto, CA",
    },
    {
      label: "Working at",
      value: "Stanford ARMLab",
    },
    {
      label: "Focus",
      value: "Robotics, systems, perception",
    },
    {
      label: "Current mode",
      value: "Builder, researcher, student",
    },
  ],
};

export const navigation = [
  { id: "home", label: "Home", path: "index.html" },
  { id: "projects", label: "Projects", path: "projects.html" },
  { id: "classes", label: "Classes", path: "classes.html" },
  { id: "notes", label: "Notes", path: "notes.html" },
  { id: "about", label: "About", path: "about.html" },
  { id: "resume", label: "Resume", path: "resume.html" },
];

export const currentStatus = {
  building: [
    {
      title: "Bench-top manipulation stack",
      copy:
        "A tighter loop for collecting demonstrations, replaying trajectories, and reviewing failures before scaling up to larger experiments.",
    },
    {
      title: "Perception and evaluation tooling",
      copy:
        "Making camera calibration, dataset versioning, and policy regression checks boringly reliable so model work is easier to trust.",
    },
    {
      title: "Robotics education kit",
      copy:
        "Continuing the low-cost kit and lesson flow from the Rise Fellowship with a stronger software path for younger students.",
    },
  ],
  role: {
    title: "Research Assistant",
    organization: "Stanford ARMLab",
    time: "2024 - Present",
    summary:
      "Working on end-to-end robotics systems at the point where perception, data pipelines, and physical hardware all start to matter at once.",
    bullets: [
      "Building tooling for policy evaluation and operator review.",
      "Moving between ROS2 orchestration, data logging, and model-side infrastructure.",
      "Treating system design as the thing that determines how fast research can iterate.",
    ],
  },
  currentClasses: [
    {
      code: "CS 227A",
      title: "Robot Perception",
      when: "Now",
      blurb: "Geometry, sensing, and decision-making for robots.",
    },
    {
      code: "EE 101A",
      title: "Circuits I",
      when: "Now",
      blurb: "A more grounded view of the hardware assumptions software leans on.",
    },
    {
      code: "CS 148",
      title: "Computer Graphics and Imaging",
      when: "Now",
      blurb: "An unexpectedly useful way to think about transforms, rendering, and cameras.",
    },
    {
      code: "PHYSICS 61",
      title: "Mechanics and Special Relativity",
      when: "Now",
      blurb: "Still one of the best reminders that models are only useful when the assumptions are explicit.",
    },
  ],
  selectedPastClasses: [
    {
      code: "CS 107E",
      title: "Computer Systems from the Ground Up",
      why: "The class that made low-level abstractions feel tangible instead of inherited.",
    },
    {
      code: "CS 123",
      title: "AI Enabled Robotics",
      why: "Interesting because it forced theory, hardware constraints, and data reality into the same room.",
    },
    {
      code: "CS 153",
      title: "Infrastructure at Scale",
      why: "A good counterweight to research projects because it asked what reliability looks like once systems stop being small.",
    },
  ],
};

export const experience = [
  {
    role: "Research Assistant",
    org: "Stanford ARMLab",
    period: "2024 - Present",
    copy:
      "Working on robotics systems and tooling for end-to-end manipulation, with an emphasis on evaluation loops, perception, and iteration speed.",
  },
  {
    role: "Rise Fellow",
    org: "Schmidt Futures",
    period: "2023 - Present",
    copy:
      "Designed a low-cost robotics kit and classroom flow aimed at making robotics more approachable for younger students.",
  },
  {
    role: "Engineering Intern",
    org: "YASA",
    period: "Summer 2023",
    copy:
      "Worked with dyno test data and debugging workflows to surface a meaningful issue in the motor testing process.",
  },
];

export const classes = {
  current: [
    {
      code: "CS 227A",
      title: "Robot Perception",
      term: "Winter 2026",
      about:
        "A course about how robots turn geometry, sensing, and noisy observations into something actionable.",
      why:
        "It is interesting because it connects elegant math to very non-elegant engineering details like calibration drift, sensor mismatch, and brittle assumptions.",
      takeaway:
        "The cleanest algorithm in the room still loses if the measurement pipeline is sloppy.",
    },
    {
      code: "EE 101A",
      title: "Circuits I",
      term: "Winter 2026",
      about:
        "Circuit analysis, dynamic behavior, and the language electrical engineers use to reason about what hardware is really doing.",
      why:
        "It sharpens intuition for the physical layer underneath the systems work I already spend time in.",
      takeaway:
        "Useful not just for electronics, but for building better instinct about failure modes and constraints.",
    },
    {
      code: "CS 148",
      title: "Computer Graphics and Imaging",
      term: "Winter 2026",
      about:
        "Rendering, imaging, geometry, and the mechanics of producing and interpreting visual scenes.",
      why:
        "The course keeps paying dividends for robotics because so much of perception starts with how you model cameras and coordinate frames.",
      takeaway:
        "Transforms are easier to trust when you have watched them break in several domains.",
    },
    {
      code: "PHYSICS 61",
      title: "Mechanics and Special Relativity",
      term: "Winter 2026",
      about:
        "A mechanics course with a strong emphasis on modeling, assumptions, and making the right simplifications.",
      why:
        "I like it because the discipline of writing down a model carefully transfers almost perfectly to engineering.",
      takeaway:
        "Good engineering often starts with choosing the correct simplification instead of the fanciest method.",
    },
  ],
  selected: [
    {
      code: "CS 107E",
      title: "Computer Systems from the Ground Up",
      term: "Winter 2025",
      about:
        "Bare-metal programming, buses, drivers, interrupts, and the mechanics of a computer with almost no abstraction cushion.",
      why:
        "It collapsed the stack in the best way. Software stopped feeling like a sealed layer and started feeling negotiable.",
      artifact:
        "Came away with a much stronger instinct for interfaces, timing, and what it actually means to control hardware directly.",
    },
    {
      code: "CS 123",
      title: "AI Enabled Robotics",
      term: "Spring 2025",
      about:
        "An applied robotics course where learning systems meet real sensing, control, and embodiment constraints.",
      why:
        "Interesting because it refused to let model-side optimism ignore robot-side reality.",
      artifact:
        "The strongest lesson was that data collection and evaluation design often matter more than the next architectural tweak.",
    },
    {
      code: "CS 153",
      title: "Infrastructure at Scale",
      term: "Autumn 2025",
      about:
        "Systems design focused on reliability, operability, and the practical consequences of scale.",
      why:
        "I liked how it turned operational maturity into a design problem instead of an afterthought.",
      artifact:
        "Helped me think more clearly about observability, rollback paths, and the cost of fragile assumptions.",
    },
    {
      code: "ENGR 40M",
      title: "Intro to Electrical Engineering",
      term: "Autumn 2024",
      about:
        "A hands-on introduction to electronics, signals, embedded work, and building physical systems quickly.",
      why:
        "The course made hardware feel approachable and gave me a taste for prototyping that stuck.",
      artifact:
        "One of the first classes that made me want to keep one foot in hardware even while doing more software-heavy work.",
    },
    {
      code: "CS 109",
      title: "Probability for Computer Scientists",
      term: "Autumn 2024",
      about:
        "Probability, statistics, and the machinery underneath uncertainty in computing.",
      why:
        "Useful because it provides the language for discussing signal, noise, and confidence without hand-waving.",
      artifact:
        "It made a lot of machine learning intuition cleaner and gave me better skepticism about results that look too certain.",
    },
    {
      code: "MATH 51",
      title: "Linear Algebra and Differential Calculus",
      term: "Autumn 2024",
      about:
        "The mathematical backbone for geometry, optimization, and a lot of engineering work.",
      why:
        "Important because so much robotics and graphics work quietly depends on being fluent with the objects, not just the notation.",
      artifact:
        "A course that keeps resurfacing in perception, control, and nearly every project involving transformations.",
    },
  ],
  areas: [
    {
      label: "Systems",
      classes: ["CS 107E", "CS 153", "Cloud computing coursework"],
    },
    {
      label: "Robotics and hardware",
      classes: ["CS 123", "CS 227A", "ENGR 40M", "EE 101A"],
    },
    {
      label: "Math and foundations",
      classes: ["CS 109", "MATH 51", "PHYSICS 61"],
    },
  ],
};

export const projects = [
  {
    slug: "bench-top-vla-stack",
    title: "Bench-Top VLA Manipulation Stack",
    subtitle: "A compact research stack for faster iteration on manipulation experiments.",
    year: "2025 - Present",
    status: "Currently building",
    role: "Research systems / robotics",
    featured: true,
    summary:
      "A smaller, tighter environment for collecting demonstrations, running model evaluations, and reviewing failures before committing to heavier lab infrastructure.",
    tags: ["ROS2", "PyTorch", "Camera calibration", "Evaluation tooling"],
    metrics: [
      { label: "Primary goal", value: "Faster iteration loops" },
      { label: "Core tension", value: "Research speed vs. reliability" },
      { label: "Mode", value: "Actively evolving" },
    ],
    overview:
      "The project started from a simple frustration: it was too easy for manipulation experiments to fail in ways that were expensive to inspect and hard to reproduce. The answer was not a bigger stack; it was a tighter one.",
    problem:
      "The team needed a way to move between teleoperation, inference, and failure review without the overhead of a full productionized robotics platform. Logs existed, but the path from data to trust was still too manual.",
    constraints: [
      "Physical experiments are expensive enough that wasted runs matter.",
      "Calibration drift, logging gaps, and brittle operator tooling can dominate model progress.",
      "The stack had to stay lightweight enough for fast iteration, not become another research project on its own.",
    ],
    decisions: [
      {
        title: "Keep the interfaces narrow",
        copy:
          "I treated data schemas, calibration outputs, and replay controls as explicit interfaces so failures were easier to localize and compare across runs.",
      },
      {
        title: "Bias toward reviewable artifacts",
        copy:
          "Instead of only collecting raw logs, the system produces clips, summaries, and structured metadata that make post-run analysis much faster.",
      },
      {
        title: "Make boring checks first-class",
        copy:
          "Regression tests for calibration assumptions and run completeness were worth more than another visualization if they prevented bad data from entering the loop.",
      },
    ],
    process: [
      {
        title: "Map the failure surface",
        copy:
          "Started by listing how runs actually fail in practice: synchronization issues, operator confusion, silent data gaps, and inconsistent resets.",
      },
      {
        title: "Build the minimum review loop",
        copy:
          "Added replay, metadata summaries, and run comparison tools before expanding the experiment surface area.",
      },
      {
        title: "Tighten the instrumentation",
        copy:
          "Improved the pipeline only when new measurements showed what was still hard to trust or inspect.",
      },
    ],
    outcome:
      "The stack is still active work, but it already functions as a better proving ground for policy and data decisions. The main win is not a flashy benchmark; it is shorter time-to-understanding when experiments go sideways.",
    diagram: {
      title: "System shape",
      columns: [
        {
          label: "Inputs",
          items: ["Teleop sessions", "RGB-D frames", "Robot state"],
        },
        {
          label: "Pipeline",
          items: ["Calibration checks", "Dataset builder", "Policy runner"],
        },
        {
          label: "Outputs",
          items: ["Replay clips", "Failure notes", "Comparison metrics"],
        },
      ],
    },
    figures: [
      {
        label: "Review loop",
        title: "Run summaries first",
        copy:
          "The first useful artifact was a clear summary card for every trial, not another hidden log file.",
      },
      {
        label: "Tooling",
        title: "Explicit calibration state",
        copy:
          "Calibration outputs are treated like versioned assets so geometry mistakes are easier to spot and compare.",
      },
      {
        label: "Evaluation",
        title: "Failure clips over anecdotes",
        copy:
          "Short reviewable clips make it easier to discuss failure patterns without relying on memory.",
      },
    ],
    resources: [
      {
        title: "Related note",
        copy: "Closing the loop before scaling the dataset",
        href: "notes/closing-the-loop.html",
      },
      {
        title: "Next step",
        copy: "Expand the evaluator beyond single-task checks",
      },
      {
        title: "Availability",
        copy: "Detailed code walkthrough available on request",
        href: "mailto:hello@benjiwarburton.com",
      },
    ],
  },
  {
    slug: "rise-robotics-kit",
    title: "Rise Robotics Kit",
    subtitle: "Low-cost robotics for younger students without the usual intimidation barrier.",
    year: "2023 - Present",
    status: "Piloted and still refining",
    role: "Hardware, curriculum, software",
    featured: true,
    summary:
      "A robotics kit built around cost, durability, and approachability, with a block-based programming flow designed for early classroom use.",
    tags: ["Arduino", "3D printing", "Curriculum design", "UI"],
    metrics: [
      { label: "Primary goal", value: "Accessible entry point" },
      { label: "Core tension", value: "Cost vs. capability" },
      { label: "Mode", value: "Pilot tested" },
    ],
    overview:
      "The idea was to build something that could survive first contact with an actual classroom while still feeling real enough to spark curiosity. That meant caring about physical design, software experience, and teaching flow at the same time.",
    problem:
      "Many beginner robotics kits are either too expensive, too fragile, or too abstracted to feel like genuine engineering. I wanted a version that stayed tangible without becoming intimidating.",
    constraints: [
      "The bill of materials needed to stay low enough to be plausible for broader access.",
      "Assembly and troubleshooting had to be manageable for students seeing these concepts for the first time.",
      "The programming interface needed to feel playful without hiding the logic completely.",
    ],
    decisions: [
      {
        title: "Design around classroom reality",
        copy:
          "I prioritized quick resets, easy-to-replace printed parts, and a workflow that could recover from mistakes without derailing a lesson.",
      },
      {
        title: "Use blocks as a ramp, not a wall",
        copy:
          "The programming surface was meant to reveal logic clearly and leave room for a more code-forward progression later.",
      },
      {
        title: "Make the kit feel like a real object",
        copy:
          "The mechanical form mattered because kids engage differently when the artifact feels sturdy and intentional instead of toy-like.",
      },
    ],
    process: [
      {
        title: "Rapid prototype the chassis",
        copy:
          "3D printed and iterated on a simple robot body that could be assembled quickly and survive repeated handling.",
      },
      {
        title: "Build the lesson loop",
        copy:
          "Paired the hardware with exercises that rewarded experimentation instead of only following instructions.",
      },
      {
        title: "Pilot with students",
        copy:
          "Demo lessons exposed where the real friction lived: setup, confidence, language, and how much debugging support beginners actually need.",
      },
    ],
    outcome:
      "The project proved that the most meaningful part of an educational robotics tool is usually the whole experience around it, not just the robot. The pilots gave me a stronger sense of how engineering choices shape confidence.",
    diagram: {
      title: "Kit architecture",
      columns: [
        {
          label: "Physical",
          items: ["Printed chassis", "Simple sensors", "Arduino control"],
        },
        {
          label: "Software",
          items: ["Block interface", "Step-by-step tasks", "Safe defaults"],
        },
        {
          label: "Learning",
          items: ["Demo lessons", "Quick wins", "Room for extension"],
        },
      ],
    },
    figures: [
      {
        label: "Prototype",
        title: "Printed parts as iteration leverage",
        copy:
          "Being able to redesign and print parts quickly made the kit adaptable without inflating cost.",
      },
      {
        label: "Interface",
        title: "Beginner logic, visible outcomes",
        copy:
          "The software needed to make cause and effect obvious within a few minutes.",
      },
      {
        label: "Teaching",
        title: "Confidence is a design target",
        copy:
          "The project reinforced that educational tools should be judged partly by how brave they make students feel.",
      },
    ],
    resources: [
      {
        title: "Related note",
        copy: "Building for kids changes your engineering standards",
        href: "notes/building-for-kids.html",
      },
      {
        title: "Next step",
        copy: "Package the curriculum and software into a cleaner classroom starter kit",
      },
      {
        title: "Availability",
        copy: "Detailed BOM and lesson plan available on request",
        href: "mailto:hello@benjiwarburton.com",
      },
    ],
  },
  {
    slug: "vision-latency-lab",
    title: "Vision Latency Lab",
    subtitle: "A focused project for making edge perception latency measurable and debuggable.",
    year: "2024",
    status: "Prototype complete",
    role: "Performance engineering",
    featured: true,
    summary:
      "A compact performance sandbox for understanding where perception time actually goes across preprocessing, inference, and transport.",
    tags: ["CUDA", "TensorRT", "C++", "Profiling"],
    metrics: [
      { label: "Primary goal", value: "Time accounting" },
      { label: "Core tension", value: "Throughput vs. observability" },
      { label: "Mode", value: "Completed prototype" },
    ],
    overview:
      "This project came from wanting a clearer answer than 'it feels slow.' I wanted to know where latency accumulated and which optimizations materially changed the end-to-end path.",
    problem:
      "Perception stacks often report model speed while quietly ignoring transfer costs, synchronization, or preprocessing bottlenecks. That makes optimization work easy to overstate.",
    constraints: [
      "The measurement setup needed to isolate components without drifting too far from a realistic pipeline.",
      "Profiling outputs had to be readable enough to compare iterations quickly.",
      "The implementation needed to stay small enough to use as a repeated experiment harness.",
    ],
    decisions: [
      {
        title: "Profile the whole path",
        copy:
          "I treated capture, preprocessing, inference, and post-processing as one chain and logged each segment explicitly.",
      },
      {
        title: "Optimize only after measurement",
        copy:
          "The point was to avoid premature low-level tuning until the bottleneck was obvious in actual traces.",
      },
      {
        title: "Keep a reproducible harness",
        copy:
          "A consistent set of inputs and configurations made comparisons meaningful instead of anecdotal.",
      },
    ],
    process: [
      {
        title: "Instrument first",
        copy:
          "Built a baseline harness that made timing visible before trying to improve anything.",
      },
      {
        title: "Run targeted optimizations",
        copy:
          "Focused on the parts with the worst payoff curve, especially transfers and pipeline boundaries.",
      },
      {
        title: "Reframe the result",
        copy:
          "The most useful outcome was not a number in isolation, but a clearer mental model of the stack.",
      },
    ],
    outcome:
      "The prototype became a reusable benchmark for future perception work. More importantly, it made performance conversations much less hand-wavy.",
    diagram: {
      title: "Latency map",
      columns: [
        {
          label: "Capture",
          items: ["Sensor input", "Frame decode", "Normalization"],
        },
        {
          label: "Inference",
          items: ["Tensor transfer", "Runtime engine", "Post-process"],
        },
        {
          label: "Review",
          items: ["Per-stage timings", "Trace snapshots", "Comparisons"],
        },
      ],
    },
    figures: [
      {
        label: "Profiling",
        title: "Trace before tune",
        copy:
          "The first deliverable was a timing story that was legible enough to challenge assumptions.",
      },
      {
        label: "Optimization",
        title: "Reduce invisible overhead",
        copy:
          "A lot of the gain came from the glue around inference rather than the model core itself.",
      },
      {
        label: "Reuse",
        title: "A benchmark that teaches",
        copy:
          "The project is most valuable as a reusable lab for future stack decisions.",
      },
    ],
    resources: [
      {
        title: "Related note",
        copy: "Latency is a pipeline problem, not a single number",
        href: "notes/latency-is-a-pipeline.html",
      },
      {
        title: "Next step",
        copy: "Apply the same harness to a live robot perception loop",
      },
      {
        title: "Availability",
        copy: "Profiling walkthrough available on request",
        href: "mailto:hello@benjiwarburton.com",
      },
    ],
  },
  {
    slug: "dyno-data-workbench",
    title: "Dyno Data Workbench",
    subtitle: "A cleaner way to review motor test data and catch process issues earlier.",
    year: "2023",
    status: "Internship project",
    role: "Data analysis / tooling",
    featured: false,
    summary:
      "An analysis workflow around dyno test data that made it easier to surface anomalies and reason about where the process itself was creating noise.",
    tags: ["Python", "Pandas", "Visualization", "Testing"],
    metrics: [
      { label: "Primary goal", value: "Faster diagnosis" },
      { label: "Core tension", value: "Signal vs. messy process data" },
      { label: "Mode", value: "Completed" },
    ],
    overview:
      "An internship project that taught me how much engineering value comes from better instrumentation and better questions, not only better models.",
    problem:
      "Motor test data contained enough ambiguity that spotting process issues depended too much on manual review and tribal knowledge.",
    constraints: [
      "The underlying process already existed, so the solution had to slot into current workflows.",
      "Data quality was uneven, which meant the analysis tooling needed to make uncertainty obvious.",
      "A useful output had to support engineers making decisions quickly, not just produce plots.",
    ],
    decisions: [
      {
        title: "Bias toward comparison views",
        copy:
          "The workbench emphasized side-by-side comparisons and trend outliers instead of isolated runs.",
      },
      {
        title: "Make assumptions explicit",
        copy:
          "The tool surfaces filtering choices and derived metrics so people can challenge them instead of treating them as hidden defaults.",
      },
      {
        title: "Treat process questions seriously",
        copy:
          "A big part of the value came from realizing the right question was not just what the motor did, but what the test process was doing.",
      },
    ],
    process: [
      {
        title: "Map the workflow",
        copy:
          "Started by understanding how engineers were already reading runs and where they lost confidence or time.",
      },
      {
        title: "Build targeted views",
        copy:
          "Created plots and comparisons that highlighted suspicious behavior instead of maximizing dashboard surface area.",
      },
      {
        title: "Use the tool to audit the process",
        copy:
          "The workbench ended up identifying a concrete testing issue that could then be addressed upstream.",
      },
    ],
    outcome:
      "The project was a good reminder that a modest internal tool can matter if it changes how quickly people notice the right problem.",
    diagram: {
      title: "Workflow",
      columns: [
        {
          label: "Inputs",
          items: ["Test runs", "Metadata", "Historical baselines"],
        },
        {
          label: "Analysis",
          items: ["Filtering", "Comparisons", "Outlier review"],
        },
        {
          label: "Output",
          items: ["Process issue", "Engineer review", "Updated tests"],
        },
      ],
    },
    figures: [
      {
        label: "Workflow",
        title: "Comparisons over dashboards",
        copy:
          "Useful views were the ones that made engineers say 'that is strange,' not the ones with the most tiles.",
      },
      {
        label: "Data",
        title: "Messy data needs visible assumptions",
        copy:
          "You trust internal tools more when the filtering logic is easy to inspect.",
      },
      {
        label: "Outcome",
        title: "Tooling that changes questions",
        copy:
          "The best tools shorten the path to the right engineering question.",
      },
    ],
    resources: [
      {
        title: "Related note",
        copy: "A better way to review dyno data",
        href: "notes/reviewing-dyno-data.html",
      },
      {
        title: "Next step",
        copy: "Port the comparison flow into a more reusable internal reporting tool",
      },
      {
        title: "Availability",
        copy: "Discussion available on request",
        href: "mailto:hello@benjiwarburton.com",
      },
    ],
  },
];

export const notes = [
  {
    slug: "closing-the-loop",
    title: "Closing the loop before scaling the dataset",
    date: "2026-03-05",
    kind: "Build log",
    excerpt:
      "A week spent making teleop logs boringly reliable paid off faster than another round of model changes.",
    summary:
      "The lesson was simple: if you cannot trust the collection and review loop, larger datasets mostly scale confusion.",
    tags: ["Robotics", "Evaluation", "Data quality"],
    sections: [
      {
        title: "Context",
        paragraphs: [
          "We had a strong temptation to keep collecting more demonstrations because the failures looked like they might wash out with scale.",
          "Instead, the more useful move was to slow down and make sure each run carried enough context to be reviewed quickly and compared cleanly.",
        ],
      },
      {
        title: "What changed",
        paragraphs: [
          "I focused on metadata completeness, replay clips, and quick visual summaries so bad runs were obvious within minutes instead of after a training cycle.",
          "That narrowed the feedback loop enough that debugging turned from vague suspicion into direct evidence.",
        ],
      },
      {
        title: "Takeaway",
        paragraphs: [
          "In robotics, scale helps only after your pipeline is honest enough to tell you what it is actually collecting.",
        ],
      },
    ],
    takeaways: [
      "Treat review artifacts as core infrastructure, not a convenience layer.",
      "Smaller trustworthy datasets beat larger ambiguous ones when iteration speed matters.",
      "When runs are expensive, clarity compounds quickly.",
    ],
  },
  {
    slug: "latency-is-a-pipeline",
    title: "Latency is a pipeline problem, not a single number",
    date: "2026-02-18",
    kind: "Technical note",
    excerpt:
      "Inference speed is easy to advertise; end-to-end timing is what actually shapes the system.",
    summary:
      "Most perception latency arguments get blurry because they isolate model timing from all the glue that surrounds it.",
    tags: ["Perception", "Performance", "Systems"],
    sections: [
      {
        title: "The trap",
        paragraphs: [
          "It is easy to talk about a model getting faster while ignoring transfer costs, preprocessing, synchronization, and review overhead.",
          "That tends to produce optimization work that sounds meaningful without changing the user-visible loop very much.",
        ],
      },
      {
        title: "Better framing",
        paragraphs: [
          "The useful question is not whether inference is fast. It is whether the whole path from sensor input to usable output is legible and improving.",
          "Once the path is instrumented end-to-end, priorities tend to get more obvious.",
        ],
      },
      {
        title: "Takeaway",
        paragraphs: [
          "The cleanest performance win is often deleting invisible overhead between components rather than over-tuning one stage in isolation.",
        ],
      },
    ],
    takeaways: [
      "Profile the whole chain, not the most glamorous component.",
      "A benchmark is most useful when it teaches where the uncertainty lives.",
      "Performance work gets better when the measurements are easy to challenge.",
    ],
  },
  {
    slug: "building-for-kids",
    title: "Building for kids changes your engineering standards",
    date: "2026-01-27",
    kind: "Field note",
    excerpt:
      "Educational hardware gets judged on confidence, resilience, and setup friction long before it gets judged on features.",
    summary:
      "Designing for younger students changes what counts as good engineering, often in ways that are healthy even for adult-facing products.",
    tags: ["Education", "Hardware", "Design"],
    sections: [
      {
        title: "What matters first",
        paragraphs: [
          "In a classroom, the first meaningful question is not performance. It is whether the object invites participation or creates hesitation.",
          "That pushes durability, clarity, recoverability, and emotional tone much higher up the priority list.",
        ],
      },
      {
        title: "What transfers back",
        paragraphs: [
          "That standard is useful beyond education. Good engineering tools also need to survive confusion, partial understanding, and mistakes.",
          "The robotics kit project made me much more sensitive to setup friction and hidden assumptions in every other interface I build.",
        ],
      },
      {
        title: "Takeaway",
        paragraphs: [
          "If a system can tolerate first-time users gracefully, it is often better engineered for everyone else too.",
        ],
      },
    ],
    takeaways: [
      "Confidence is a real design target.",
      "Fast recovery from mistakes matters more than a long feature list.",
      "Hardware and software both teach through their default behavior.",
    ],
  },
  {
    slug: "reviewing-dyno-data",
    title: "A better way to review dyno data",
    date: "2025-12-11",
    kind: "Work note",
    excerpt:
      "Useful internal analysis tools are often the ones that help engineers ask a sharper question, not the ones that make the flashiest chart.",
    summary:
      "A short note on why comparison views and explicit assumptions mattered more than dashboard density in a motor testing workflow.",
    tags: ["Data analysis", "Tooling", "Workflow"],
    sections: [
      {
        title: "Start with the workflow",
        paragraphs: [
          "The most important discovery was that engineers were not missing more charts. They were missing faster ways to compare runs and notice process oddities.",
          "That changed the tool from a reporting surface into a decision aid.",
        ],
      },
      {
        title: "Show your assumptions",
        paragraphs: [
          "Filtering and derived metrics needed to stay visible. When assumptions are hidden, internal tools accumulate skepticism even if they are technically useful.",
        ],
      },
      {
        title: "Takeaway",
        paragraphs: [
          "If a tool shortens the path to the right question, it has done enough.",
        ],
      },
    ],
    takeaways: [
      "Comparison is often more useful than aggregation.",
      "The best internal tools increase trust as much as they increase speed.",
      "Process debugging is still engineering work.",
    ],
  },
];

export const aboutPage = {
  paragraphs: [
    "I am an EE / CS student at Stanford interested in work that sits somewhere between software, robotics, and physical systems. The pattern I keep coming back to is simple: I like building things where the interface between abstraction and reality is impossible to ignore.",
    "That usually means projects with some mix of hardware, perception, systems tooling, and experimentation. I enjoy the model side, but I am equally interested in the surrounding infrastructure that determines whether those models are actually useful.",
    "Outside of the technical stack itself, I care about craftsmanship. I like clean interfaces, understandable systems, and writing that makes technical decisions legible instead of theatrical.",
  ],
  principles: [
    {
      title: "Build for faster understanding",
      copy:
        "I like systems that shorten the path from failure to insight. That usually means better interfaces, better logging, and better defaults.",
    },
    {
      title: "Respect physical constraints",
      copy:
        "Projects get more interesting when timing, embodiment, cost, and messy environments actually matter.",
    },
    {
      title: "Keep the tone serious",
      copy:
        "I prefer technical work that feels calm, clear, and grounded rather than over-performed.",
    },
  ],
};

export const resumeData = {
  education: {
    title: "Education",
    lines: [
      "Stanford University",
      "Electrical Engineering / Computer Science",
      "Focus: robotics, systems, machine learning, and hardware-aware software",
    ],
  },
  skills: [
    {
      title: "Systems and software",
      copy:
        "Python, C/C++, ROS2, PyTorch, data tooling, evaluation workflows, internal tools",
    },
    {
      title: "Hardware and prototyping",
      copy:
        "Arduino, 3D printing, sensor integration, embedded experimentation, physical prototyping",
    },
    {
      title: "Ways of working",
      copy:
        "Case-study thinking, fast iteration, technical writing, debugging with evidence, builder-oriented research support",
    },
  ],
};

export function getProjectBySlug(slug) {
  return projects.find((project) => project.slug === slug);
}

export function getNoteBySlug(slug) {
  return notes.find((note) => note.slug === slug);
}

import { Experiment, ApparatusItem, VideoLesson } from "@/types";

export const experiments: Experiment[] = [
  {
    id: "mitochondria-001",
    title: "Mitochondria Structure Explorer",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Cell Structure & Function",
    gradeLevel: "Grade 8",
    description:
      "Explore the powerhouse of the cell in interactive 3D. Identify the cristae, matrix, and double membrane while learning how ATP is generated.",
    thumbnail: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80",
    assetType: "3d_model",
    modelUrl:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
    tags: ["cell biology", "organelles", "energy"],
  },
  {
    id: "nucleus-001",
    title: "Cell Nucleus & DNA Packaging",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Cell Structure & Function",
    gradeLevel: "Grade 8",
    description:
      "Visualize chromatin, the nuclear envelope, and nucleolus. Understand how DNA is protected and organized inside the nucleus.",
    thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
    assetType: "3d_model",
    modelUrl:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb",
    tags: ["genetics", "nucleus", "dna"],
  },
  {
    id: "rift-valley-001",
    title: "The Great Rift Valley",
    subject: "Geography",
    strand: "The Physical Environment",
    subStrand: "Internal Land-Forming Processes",
    gradeLevel: "Grade 7",
    description:
      "A 3D topographic model of the East African Rift System. Examine fault lines, escarpments, and volcanic activity along the Kenyan section.",
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
    assetType: "3d_model",
    modelUrl:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
    tags: ["geography", "rift valley", "volcanism", "kenya"],
  },
  {
    id: "osmosis-video-001",
    title: "Osmosis in a Potato Cell",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Plant & Animal Nutrition",
    gradeLevel: "Grade 8",
    description:
      "Watch a step-by-step practical demonstration of osmosis using potato strips in hypotonic and hypertonic solutions.",
    thumbnail: "https://images.unsplash.com/photo-1518843870304- genetic-resources?w=800&q=80",
    assetType: "video",
    videoUrl: "#",
    tags: ["osmosis", "diffusion", "practical"],
  },
  {
    id: "microscope-001",
    title: "Using a Light Microscope",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Observation & Classification",
    gradeLevel: "Grade 7",
    description:
      "Learn the parts and proper handling of a school light microscope. Focus techniques and slide preparation guide.",
    thumbnail: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    assetType: "image",
    tags: ["microscope", "lab skills", "observation"],
  },
];

export const apparatus: ApparatusItem[] = [
  {
    id: "app-001",
    name: "Compound Light Microscope",
    category: "Observation",
    description:
      "Optical instrument used to magnify small objects. School grade with 40x–400x magnification.",
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80",
    safetyNotes: "Always carry with both hands. Clean lenses with lens paper only.",
  },
  {
    id: "app-002",
    name: "Bunsen Burner",
    category: "Heating",
    description:
      "Laboratory gas burner producing a single open flame. Used for heating, sterilization, and combustion.",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80",
    safetyNotes: "Tie back long hair. Never leave unattended. Check gas tubing for leaks.",
  },
  {
    id: "app-003",
    name: "Measuring Cylinder",
    category: "Measurement",
    description:
      "Graduated cylinder for measuring liquid volumes accurately. Read at eye level at the meniscus.",
    imageUrl: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&q=80",
    safetyNotes: "Place on a flat surface. Do not use for mixing or heating.",
  },
  {
    id: "app-004",
    name: "Test Tube Rack",
    category: "Storage",
    description:
      "Holds multiple test tubes upright. Essential for organizing reactions and preventing spills.",
    imageUrl: "https://images.unsplash.com/photo-1608037521244-f1c6c7635194?w=600&q=80",
    safetyNotes: "Ensure tubes are cool before placing in rack.",
  },
  {
    id: "app-005",
    name: "Dropper / Pipette",
    category: "Transfer",
    description:
      "Used to transfer small volumes of liquid. Some have rubber bulbs; others use suction.",
    imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&q=80",
    safetyNotes: "Never pipette by mouth in school labs. Use a bulb or pump.",
  },
];

export const videos: VideoLesson[] = [
  {
    id: "vid-001",
    title: "Osmosis in a Potato Cell",
    subject: "Biology",
    duration: "4:32",
    thumbnail: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=600&q=80",
    videoUrl: "#",
    description:
      "Demonstrates water movement across a semi-permeable membrane using potato cylinders in salt solutions.",
  },
  {
    id: "vid-002",
    title: "Distillation of Dirty Water",
    subject: "Chemistry",
    duration: "6:15",
    thumbnail: "https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?w=600&q=80",
    videoUrl: "#",
    description:
      "Simple distillation setup for separating mixtures and purifying water. Suitable for Grade 7 CBC.",
  },
  {
    id: "vid-003",
    title: "Testing for Starch in Leaves",
    subject: "Biology",
    duration: "5:48",
    thumbnail: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    videoUrl: "#",
    description:
      "Iodine test procedure for photosynthesis experiments. Includes boiling, decolourization, and staining.",
  },
  {
    id: "vid-004",
    title: "Measuring Earthquake Waves",
    subject: "Geography",
    duration: "7:02",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
    videoUrl: "#",
    description:
      "Seismograph demonstration and interpretation of P-waves and S-waves in the Kenyan context.",
  },
];

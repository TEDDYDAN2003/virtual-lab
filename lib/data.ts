import { Experiment, ApparatusItem, VideoLesson } from "@/types";

export const experiments: Experiment[] = [
  {
    id: "animal-cell-001",
    title: "Animal Cell Explorer",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Cell Structure & Function",
    gradeLevel: "Grade 8",
    description:
      "Explore a detailed NIH-sourced animal cell in interactive 3D. Click the blue hotspots to identify the nucleus, mitochondria, endoplasmic reticulum, and other organelles.",
    thumbnail: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/animal-cell-nih.glb",
    modelScale: 1.2,
    tags: ["cell biology", "organelles", "animal cell", "NIH"],
    hotspots: [
      {
        position: [0.3, 0.2, 0.1],
        label: "Nucleus",
        description:
          "The control center of the cell. Contains DNA and directs all cellular activities including growth, metabolism, and reproduction. Surrounded by a nuclear envelope with pores.",
      },
      {
        position: [-0.2, 0.3, 0.2],
        label: "Mitochondria",
        description:
          "The powerhouse of the cell. Generates ATP through cellular respiration. Has a double membrane with inner folds called cristae that increase surface area for energy production.",
      },
      {
        position: [0.1, -0.2, 0.3],
        label: "Endoplasmic Reticulum",
        description:
          "A network of membranes involved in protein and lipid synthesis. Rough ER has ribosomes attached and makes proteins; smooth ER synthesizes lipids and detoxifies drugs.",
      },
      {
        position: [-0.3, -0.1, -0.2],
        label: "Golgi Apparatus",
        description:
          "The packaging and shipping center. Modifies, sorts, and packages proteins and lipids into vesicles for transport to their final destinations inside or outside the cell.",
      },
      {
        position: [0.2, 0.4, -0.1],
        label: "Cell Membrane",
        description:
          "A phospholipid bilayer that controls what enters and exits the cell. Contains proteins for transport, signaling, and cell recognition. Maintains homeostasis.",
      },
    ],
  },
  {
    id: "neuron-001",
    title: "Neuron Structure & Synapse",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "The Nervous System",
    gradeLevel: "Grade 8",
    description:
      "Examine a medically accurate neuron model. Click hotspots to learn about the axon, dendrites, soma, and how nerve impulses travel.",
    thumbnail: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/neuron-nih.glb",
    modelScale: 1.5,
    tags: ["neuron", "nervous system", "anatomy", "NIH"],
    hotspots: [
      {
        position: [0, 0.4, 0],
        label: "Dendrites",
        description:
          "Branch-like extensions that receive messages from other cells and conduct electrical signals toward the cell body. The more dendrites, the more signals a neuron can receive.",
      },
      {
        position: [0, 0, 0],
        label: "Cell Body (Soma)",
        description:
          "Contains the nucleus and organelles. Processes incoming signals and decides whether to fire an action potential. The metabolic center of the neuron.",
      },
      {
        position: [0, -0.5, 0],
        label: "Axon",
        description:
          "A long fiber that transmits electrical impulses away from the cell body toward other neurons or muscles. Can be myelinated for faster signal transmission.",
      },
      {
        position: [0, -0.9, 0],
        label: "Axon Terminals",
        description:
          "The endpoints of the axon that release neurotransmitters across the synapse to communicate with the next neuron in the circuit.",
      },
    ],
  },
  {
    id: "bacteria-001",
    title: "Bacteria Cell Wall",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Microorganisms",
    gradeLevel: "Grade 7",
    description:
      "Visualize the protective cell wall of bacteria. Click hotspots to study peptidoglycan layers, flagella, and pili.",
    thumbnail: "https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/bacteria-wall-nih.glb",
    modelScale: 2.0,
    tags: ["bacteria", "microorganisms", "cell wall", "NIH"],
    hotspots: [
      {
        position: [0, 0, 0.3],
        label: "Cell Wall",
        description:
          "A rigid outer layer made of peptidoglycan that gives bacteria their shape and protects them from osmotic pressure. The primary target of many antibiotics like penicillin.",
      },
      {
        position: [0.4, 0, 0],
        label: "Flagellum",
        description:
          "A whip-like appendage used for locomotion. Rotates like a propeller to move the bacterium toward nutrients or away from harmful substances.",
      },
      {
        position: [-0.3, 0.2, 0.1],
        label: "Pili",
        description:
          "Hair-like structures on the surface used for attachment to surfaces and other bacteria. Some pili (sex pili) are used to transfer DNA between bacteria.",
      },
      {
        position: [0, 0, 0],
        label: "Cytoplasm",
        description:
          "The gel-like substance inside the cell containing ribosomes, enzymes, and the nucleoid region where the circular DNA is located.",
      },
    ],
  },
  {
    id: "horse-001",
    title: "Horse Anatomy",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Animal Adaptations",
    gradeLevel: "Grade 7",
    description:
      "Study the skeletal and muscular structure of a horse. Observe how limb anatomy supports locomotion and weight-bearing in large mammals.",
    thumbnail: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/horse.glb",
    modelScale: 0.015,
    hasAnimation: true,
    tags: ["mammals", "anatomy", "locomotion", "skeleton"],
    hotspots: [
      {
        position: [0, 1.8, 0.3],
        label: "Skull & Cranium",
        description:
          "The skull protects the brain and houses sensory organs. Horses have large eye sockets for wide peripheral vision and strong jaw muscles for grazing.",
      },
      {
        position: [0, 1.2, 0.2],
        label: "Spinal Column",
        description:
          "A strong vertebral column that supports the body and protects the spinal cord. Horses have 54 vertebrae — more than humans — allowing flexible neck and back movement.",
      },
      {
        position: [0.4, 0.8, 0.1],
        label: "Ribcage",
        description:
          "The ribcage protects the heart and lungs. In horses, the ribs are long and angled to allow for the large lung capacity needed for running.",
      },
      {
        position: [0.5, 0.3, 0.2],
        label: "Forelimb",
        description:
          "Horses are digitigrade animals — they walk on their toes. The forelimb bones are adapted to absorb shock and support the animal's weight during galloping.",
      },
      {
        position: [-0.5, 0.3, 0.2],
        label: "Hind Limb",
        description:
          "The powerful hind limbs provide propulsion. Large muscle groups around the femur and tibia generate the force needed for speed and jumping.",
      },
    ],
  },
  {
    id: "fox-001",
    title: "Fox Specimen",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Animal Adaptations",
    gradeLevel: "Grade 6",
    description:
      "Examine a low-poly fox model. Click hotspots to understand canine body proportions, tail structure for balance, and adaptations for predation.",
    thumbnail: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/fox.glb",
    modelScale: 0.02,
    hasAnimation: true,
    tags: ["mammals", "canine", "adaptations", "predator"],
    hotspots: [
      {
        position: [0, 0.6, 0.2],
        label: "Head & Snout",
        description:
          "The elongated snout houses sharp teeth for tearing meat and an excellent sense of smell. Foxes can hear rodents digging underground from 40 meters away.",
      },
      {
        position: [0, 0.3, -0.4],
        label: "Bushy Tail",
        description:
          "The thick tail aids balance during quick turns, provides warmth in cold weather when wrapped around the body, and is used for communication with other foxes.",
      },
      {
        position: [0.3, 0, 0.1],
        label: "Forelimbs",
        description:
          "Slender legs with semi-retractable claws for gripping prey. The light bone structure allows foxes to reach speeds up to 50 km/h in short bursts.",
      },
      {
        position: [0, -0.1, 0.2],
        label: "Coat & Fur",
        description:
          "The dense double coat provides insulation. The reddish-brown coloration is camouflage in woodland and grassland habitats during autumn.",
      },
    ],
  },
  {
    id: "fish-001",
    title: "Barramundi Fish Anatomy",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Aquatic Life & Fish",
    gradeLevel: "Grade 7",
    description:
      "Investigate the streamlined body, fin placement, and scale patterns. Click hotspots to learn how form supports aquatic locomotion.",
    thumbnail: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/barramundi-fish.glb",
    modelScale: 8.0,
    tags: ["fish", "aquatic", "anatomy", "locomotion"],
    hotspots: [
      {
        position: [0.3, 0.1, 0.1],
        label: "Dorsal Fin",
        description:
          "The fin on the fish's back provides stability during swimming, preventing rolling. Barramundi have a spiny anterior dorsal fin and a soft-rayed posterior fin.",
      },
      {
        position: [0, 0, 0.2],
        label: "Lateral Line",
        description:
          "A sensory organ running along the side of the body that detects vibrations and pressure changes in the water, helping the fish navigate and locate prey in murky water.",
      },
      {
        position: [-0.4, 0, 0.1],
        label: "Caudal Fin",
        description:
          "The tail fin provides the main propulsive force. Its forked shape in barramundi allows for powerful acceleration and sustained cruising speeds.",
      },
      {
        position: [0.1, -0.2, 0.1],
        label: "Pectoral Fin",
        description:
          "Located on the sides near the head, these fins help with steering, braking, and maintaining position in the water column. They can also be used to 'walk' along the bottom.",
      },
    ],
  },
  {
    id: "mosquito-001",
    title: "Mosquito in Amber",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Insects & Fossils",
    gradeLevel: "Grade 8",
    description:
      "Study a mosquito preserved in amber. Click hotspots to observe insect anatomy including wings, proboscis, and compound eyes.",
    thumbnail: "https://images.unsplash.com/photo-1504392022767-a8fc0771f239?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/mosquito-in-amber.glb",
    modelScale: 3.0,
    tags: ["insects", "fossils", "amber", "paleontology"],
    hotspots: [
      {
        position: [0, 0.3, 0.1],
        label: "Compound Eyes",
        description:
          "Mosquitoes have large compound eyes made of hundreds of tiny lenses (ommatidia), giving them a wide field of vision to detect movement and find hosts.",
      },
      {
        position: [0.1, 0.2, 0.2],
        label: "Proboscis",
        description:
          "The long, needle-like feeding tube. Only female mosquitoes bite — they use the proboscis to pierce skin and draw blood for egg development.",
      },
      {
        position: [-0.1, 0, 0.2],
        label: "Wings",
        description:
          "Mosquitoes have one pair of membranous wings covered in tiny scales. They beat 400–600 times per second, producing the characteristic buzzing sound.",
      },
      {
        position: [0, -0.2, 0.1],
        label: "Amber Preservation",
        description:
          "This mosquito was trapped in tree resin (sap) millions of years ago. The resin hardened into amber, preserving the insect's body in incredible detail.",
      },
    ],
  },
  {
    id: "avocado-001",
    title: "Avocado Plant Structure",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Plant Reproduction",
    gradeLevel: "Grade 7",
    description:
      "Examine the seed, cotyledon, and outer skin. Click hotspots to understand how dicot seeds store energy and support early plant growth.",
    thumbnail: "https://images.unsplash.com/photo-1523049673856-606ae93a9c9d?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/avocado.glb",
    modelScale: 8.0,
    tags: ["plants", "seeds", "dicot", "botany"],
    hotspots: [
      {
        position: [0, 0.1, 0.1],
        label: "Seed Coat",
        description:
          "The tough outer layer (testa) protects the embryo inside from physical damage and pathogens. In avocados, the seed coat is thin but effective.",
      },
      {
        position: [0, 0, 0],
        label: "Cotyledon",
        description:
          "The fleshy part of the seed that stores food (starch and oils) for the developing embryo. Avocados are dicots — they have two cotyledons. This stored energy fuels early growth before photosynthesis begins.",
      },
      {
        position: [0, -0.1, 0],
        label: "Embryo",
        description:
          "The miniature plant inside the seed consisting of the radicle (future root), plumule (future shoot), and one or two cotyledons. Given water and warmth, it germinates into a new avocado tree.",
      },
      {
        position: [0, 0.2, 0.1],
        label: "Pericarp (Fruit Skin)",
        description:
          "The outer fruit wall that protects the seed and aids in dispersal. The dark green skin of an avocado is the exocarp, the fleshy part is the mesocarp.",
      },
    ],
  },
  {
    id: "flowers-001",
    title: "Glass Vase Flowers",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Plant Parts & Functions",
    gradeLevel: "Grade 6",
    description:
      "Study flower anatomy. Click hotspots to learn about petals, stem, and leaves, and how flowers attract pollinators.",
    thumbnail: "https://images.unsplash.com/photo-1490750967868-88aa6f44c0e3?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/glass-vase-flowers.glb",
    modelScale: 3.0,
    tags: ["flowers", "plants", "pollination", "botany"],
    hotspots: [
      {
        position: [0, 0.4, 0.1],
        label: "Petals",
        description:
          "Brightly colored to attract pollinators like bees and butterflies. The petals are modified leaves that protect the reproductive parts of the flower before it opens.",
      },
      {
        position: [0, 0.2, 0.1],
        label: "Stamen",
        description:
          "The male reproductive part consisting of the anther (which produces pollen) and the filament (the stalk that holds the anther up).",
      },
      {
        position: [0, 0, 0.1],
        label: "Pistil",
        description:
          "The female reproductive part at the center of the flower. It includes the stigma (which receives pollen), the style (the tube), and the ovary (which contains ovules that become seeds after fertilization).",
      },
      {
        position: [0, -0.5, 0.1],
        label: "Stem & Leaves",
        description:
          "The stem supports the flower and transports water and nutrients. Leaves perform photosynthesis to produce the sugars the plant needs to grow and produce flowers.",
      },
    ],
  },
  {
    id: "brain-stem-001",
    title: "Brain Stem Anatomy",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "The Nervous System",
    gradeLevel: "Grade 8",
    description:
      "Explore the brain stem and cerebellum. Click hotspots to understand how this region controls vital autonomic functions.",
    thumbnail: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/brain-stem.glb",
    modelScale: 1.5,
    hasAnimation: true,
    tags: ["brain", "anatomy", "nervous system", "medical"],
    hotspots: [
      {
        position: [0, 0.3, 0.1],
        label: "Cerebellum",
        description:
          "The 'little brain' at the back of the head. Coordinates voluntary movements, balance, posture, and motor learning. It processes sensory input to fine-tune muscle activity.",
      },
      {
        position: [0, 0, 0.2],
        label: "Midbrain",
        description:
          "Controls visual and auditory reflexes, eye movement, and motor control. It contains structures like the colliculi that help orient the body toward sights and sounds.",
      },
      {
        position: [0, -0.2, 0.1],
        label: "Pons",
        description:
          "A bridge-like structure that connects the cerebrum to the cerebellum and medulla. It relays signals between the forebrain and cerebellum and helps regulate breathing.",
      },
      {
        position: [0, -0.5, 0.1],
        label: "Medulla Oblongata",
        description:
          "The lowest part of the brain stem, continuous with the spinal cord. Controls involuntary vital functions: heartbeat, breathing, blood pressure, and reflexes like sneezing and swallowing.",
      },
    ],
  },
  {
    id: "tropical-plant-001",
    title: "Tropical Plant Adaptations",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Plant Adaptations",
    gradeLevel: "Grade 7",
    description:
      "Observe leaf structure and stem morphology. Click hotspots to learn how plants adapt to humid environments.",
    thumbnail: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/diffuse-transmission-plant.glb",
    modelScale: 2.5,
    tags: ["plants", "tropical", "adaptations", "leaves"],
    hotspots: [
      {
        position: [0.3, 0.4, 0.1],
        label: "Broad Leaves",
        description:
          "Large, flat leaves maximize light capture in the dim understory of tropical forests. The waxy cuticle reduces water loss in humid conditions.",
      },
      {
        position: [0, 0, 0.2],
        label: "Veins (Vascular Bundles)",
        description:
          "The network of xylem and phloem transports water, minerals, and sugars throughout the plant. In tropical plants, dense venation supports large leaf size.",
      },
      {
        position: [0, -0.3, 0.1],
        label: "Stem",
        description:
          "The stem supports leaves and flowers and contains vascular tissue. In some tropical plants, stems are also green and photosynthetic.",
      },
      {
        position: [-0.2, 0.2, 0.1],
        label: "Drip Tip",
        description:
          "The pointed tip of many tropical leaves allows rainwater to run off quickly, preventing fungal growth and reducing weight on the leaf.",
      },
    ],
  },
  {
    id: "flamingo-001",
    title: "Flamingo Specimen",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Birds & Flight",
    gradeLevel: "Grade 6",
    description:
      "Study the long legs, curved beak, and wing structure. Click hotspots to understand adaptations for wading and filter-feeding.",
    thumbnail: "https://images.unsplash.com/photo-1497206365907-f5e3f0e6fe99?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/flamingo.glb",
    modelScale: 0.015,
    hasAnimation: true,
    tags: ["birds", "flamingo", "adaptations", "wading"],
    hotspots: [
      {
        position: [0, 0.8, 0.2],
        label: "Curved Beak",
        description:
          "Specially shaped for filter-feeding. The flamingo dips its head upside-down in water and uses its tongue to pump water through comb-like structures (lamellae) in the beak, filtering out algae and crustaceans.",
      },
      {
        position: [0.2, 0.3, 0.1],
        label: "Long Legs",
        description:
          "Allow flamingos to wade in deep water where other birds cannot reach. The knees appear to bend backward — actually, those are ankles; the knees are hidden under feathers.",
      },
      {
        position: [-0.2, 0.2, -0.1],
        label: "Wings",
        description:
          "The pink color comes from carotenoids in their diet. Flamingos are strong flyers and can travel hundreds of kilometers between breeding and feeding grounds.",
      },
      {
        position: [0, -0.2, 0.2],
        label: "Webbed Feet",
        description:
          "The webbed feet provide stability on soft mud and help with swimming. Flamingos often stand on one leg to conserve body heat.",
      },
    ],
  },
  {
    id: "parrot-001",
    title: "Parrot Specimen",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Birds & Flight",
    gradeLevel: "Grade 6",
    description:
      "Examine the hooked beak, zygodactyl feet, and vibrant wing feathers. Click hotspots to learn how these features support climbing and flight.",
    thumbnail: "https://images.unsplash.com/photo-1552728089-57bdde30beb8?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/parrot.glb",
    modelScale: 0.015,
    hasAnimation: true,
    tags: ["birds", "parrot", "flight", "feathers"],
    hotspots: [
      {
        position: [0.1, 0.5, 0.2],
        label: "Hooked Beak",
        description:
          "The strong, curved beak is perfect for cracking hard nuts and seeds. The upper beak is hinged, allowing parrots to apply tremendous pressure when biting.",
      },
      {
        position: [0.2, 0.1, 0.1],
        label: "Zygodactyl Feet",
        description:
          "Two toes point forward and two backward. This arrangement provides excellent grip for climbing, perching, and manipulating food — like having hands on their feet.",
      },
      {
        position: [-0.2, 0.2, -0.1],
        label: "Wing Feathers",
        description:
          "The long primary feathers provide lift and thrust for flight. The bright colors come from structural coloration and pigments, used for mate attraction and species recognition.",
      },
      {
        position: [0, -0.1, 0.2],
        label: "Tail",
        description:
          "The long tail acts as a rudder during flight and provides balance when climbing. Some parrots use their tail as a prop when climbing vertical surfaces.",
      },
    ],
  },
  {
    id: "stork-001",
    title: "Stork Specimen",
    subject: "Biology",
    strand: "Living Things & Their Environment",
    subStrand: "Birds & Flight",
    gradeLevel: "Grade 6",
    description:
      "Observe the long neck, broad wings, and sharp bill. Click hotspots to understand how body proportions support long-distance migration.",
    thumbnail: "https://images.unsplash.com/photo-1504392022767-a8fc0771f239?w=800&q=80",
    assetType: "3d_model",
    modelUrl: "/models/stork.glb",
    modelScale: 0.015,
    hasAnimation: true,
    tags: ["birds", "stork", "migration", "wading"],
    hotspots: [
      {
        position: [0, 0.7, 0.2],
        label: "Long Neck",
        description:
          "The extended neck allows storks to reach into water and tall grass to catch frogs, fish, and insects. It folds back in flight to reduce air resistance.",
      },
      {
        position: [0.1, 0.4, 0.1],
        label: "Sharp Bill",
        description:
          "The long, pointed bill is a spear-like weapon for catching prey. Storks are carnivorous and eat a wide variety of small animals.",
      },
      {
        position: [-0.2, 0.1, -0.1],
        label: "Broad Wings",
        description:
          "Large wingspans (up to 2 meters) allow storks to soar on thermal updrafts with minimal energy. This is essential for their long migrations between Europe and Africa.",
      },
      {
        position: [0.2, -0.3, 0.1],
        label: "Long Legs",
        description:
          "Enable wading in shallow wetlands. Storks often stand still for long periods waiting for prey to come within striking distance.",
      },
    ],
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
    thumbnail: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=800&q=80",
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

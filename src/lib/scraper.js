import { ApifyClient } from 'apify-client';
import 'dotenv/config';

// 1. Group the keys into an array
const apifyKeys = [
    process.env.APIFY_API_TOKEN_1,
    process.env.APIFY_API_TOKEN_2,
    process.env.APIFY_API_TOKEN_3,
    process.env.APIFY_API_TOKEN_4
].filter(Boolean); // This ensures it doesn't crash if you temporarily only have 2 keys

// We'll initialize the client and handle the runNumber logic dynamically inside scrapeLatestPost
// so we can loop over the keys if one of them fails.

// Prepare Actor input
const input = {
    "dataDetailLevel": "basicData",
    "resultsLimit": 1,
    "skipPinnedPosts": true,
    "username": [
        "https://www.instagram.com/carletoncss",
        "https://www.instagram.com/ieeecarleton/",
        "https://www.instagram.com/carletonscisoc",
        "https://www.instagram.com/cuscesoc",
        "https://www.instagram.com/carletonbitsociety/",
        "https://www.instagram.com/animalrightscarleton/",
        "https://www.instagram.com/AnimeCarleton/",
        "https://www.instagram.com/asaottawa/",
        "https://www.instagram.com/azsaottawa/",
        "https://www.instagram.com/carletonbitsociety/",
        "https://www.instagram.com/bswss.cu/",
        "https://www.instagram.com/carleton_biocare/",
        "https://www.instagram.com/bsacarletonu",
        "https://www.instagram.com/carleton_bridgestudyclub/",
        "https://www.instagram.com/camskids_carletonu/",
        "https://www.instagram.com/cscecarleton/",
        "https://www.instagram.com/csacarleton/",
        "https://www.instagram.com/carleton.asa/",
        "https://www.instagram.com/carletonaisociety/",
        "https://www.instagram.com/_cahus/",
        "https://www.instagram.com/cu_badminton_club/",
        "https://www.instagram.com/cubookartssociety/",
        "https://www.instagram.com/carleton.cusec/",
        "https://www.instagram.com/carletoncbs/",
        "https://www.instagram.com/carletonchess/",
        "https://www.instagram.com/carletonclimbing/",
        "https://www.instagram.com/cu.cogsciassociation/",
        "https://www.instagram.com/cucomssociety/",
        "https://www.instagram.com/corkandtaste/",
        "https://www.instagram.com/carletondancelab/",
        "https://www.instagram.com/cengmusical/",
        "https://www.instagram.com/carletonfilmsoc/",
        "https://www.instagram.com/cufloorballclub/",
        "https://www.instagram.com/foodforthecapital/",
        "https://www.instagram.com/carletonglee/",
        "https://www.instagram.com/carletonHSS/",
        "https://www.instagram.com/impact.carleton/",
        "https://www.instagram.com/carletonimprov/",
        "https://www.instagram.com/cirsociety/",
        "https://www.instagram.com/carletonlebsoc/",
        "https://www.instagram.com/cmas_gram/",
        "https://www.instagram.com/carletonmoot/",
        "https://www.instagram.com/carletonmts",
        "https://www.instagram.com/cuneurosociety/",
        "https://www.instagram.com/psa.carleton/",
        "https://www.instagram.com/carletonpathwaysinstem/",
        "https://www.instagram.com/carletonplanetaryrobotics/",
        "https://www.instagram.com/carletonpss/",
        "https://www.instagram.com/carletonpowerlifting/",
        "https://www.instagram.com/cupredentalsociety/",
        "https://www.instagram.com/cupremedsociety/",
        "https://www.instagram.com/carletoncqcs/",
        "https://www.instagram.com/carletonqta/",
        "https://www.instagram.com/cu_sisterhoodsociety/",
        "https://www.instagram.com/seg.carleton/",
        "https://www.instagram.com/carletonsquash/",
        "https://www.instagram.com/carletonufieldhockey/",
        "https://www.instagram.com/cukrainians/",
        "https://www.instagram.com/carletoneconsociety/",
        "https://www.instagram.com/cugesa/",
        "https://www.instagram.com/carletonanandamarga/",
        "https://www.instagram.com/carleton.astro/",
        "https://www.instagram.com/bsa_carleton/",
        "https://www.instagram.com/carletonbioethicssociety/",
        "https://www.instagram.com/cubes.carleton/",
        "https://www.instagram.com/cublueprint/",
        "https://www.instagram.com/cudancecrew/",
        "https://www.instagram.com/carleton.debate/",
        "https://www.instagram.com/cu.designleague/feed/",
        "https://www.instagram.com/carletondragonboat/",
        "https://www.instagram.com/cuengiqueers/",
        "https://www.instagram.com/cufsa/",
        "https://www.instagram.com/cufirearms/",
        "https://www.instagram.com/hss.carleton/",
        "https://www.instagram.com/cukisofficial/",
        "https://www.instagram.com/carletonmsa/",
        "https://www.instagram.com/carletonndp/",
        "https://www.instagram.com/cunsa16/",
        "https://www.instagram.com/cuonorbit/",
        "https://www.instagram.com/cuphilosophysociety/",
        "https://www.instagram.com/carletonuphoto/",
        "https://www.instagram.com/cuphyssoc/",
        "https://www.instagram.com/carletonussa/",
        "https://www.instagram.com/carletonstrategyclub/",
        "https://www.instagram.com/carletonadmirals/",
        "https://www.instagram.com/cuwomenslegalnetwork/",
        "https://www.instagram.com/cuccjs/",
        "https://www.instagram.com/cuhrss/",
        "https://www.instagram.com/cuwomenflagfootball/",
        "https://www.instagram.com/cuwritersguild/",
        "https://www.instagram.com/ccocampus/",
        "https://www.instagram.com/carletonu_inspace/",
        "https://www.instagram.com/rflcarleton/",
        "https://www.instagram.com/cuhacking/",
        "https://www.instagram.com/cudesoc/",
        "https://www.instagram.com/esacu/",
        "https://www.instagram.com/carletonewb/",
        "https://www.instagram.com/essacarleton/",
        "https://www.instagram.com/eesa.cu/",
        "https://www.instagram.com/carleton_foodsciencesociety/",
        "https://www.instagram.com/girlgains.co/",
        "https://www.instagram.com/globalmindscarleton/",
        "https://www.instagram.com/gca_carleton/",
        "https://www.instagram.com/healthtechinnovators/",
        "https://www.instagram.com/hccarleton/",
        "https://www.instagram.com/h.o.l.a.s/",
        "https://www.instagram.com/ijvcarleton/",
        "https://www.instagram.com/intervarsity_cu/",
        "https://www.instagram.com/cujsoc/",
        "https://www.instagram.com/culandscapelab/",
        "https://www.instagram.com/carletonnsa/",
        "https://www.instagram.com/naais_cu/",
        "https://www.instagram.com/ottawacobras/",
        "https://www.instagram.com/ottawaisa/",
        "https://www.instagram.com/psa_carleton/",
        "https://www.instagram.com/papmss/",
        "https://www.instagram.com/csnottawa/",
        "https://www.instagram.com/susa.carleton/",
        "https://www.instagram.com/thenavigatorsca/",
        "https://www.instagram.com/thepoeticsocietycu/",
        "https://www.instagram.com/aevsaott/",
        "https://www.instagram.com/visualartscarleton/",
        "https://www.instagram.com/carletonbookravens/"
    ]
};

export async function scrapeLatestPost() {
    const actorId = "nH2AHrwxeTRJoN5hX";
    
    // Grab the GitHub run number, defaults to 0
    const runNumber = parseInt(process.env.RUN_NUMBER || "0", 10);
    const startIndex = runNumber % apifyKeys.length;

    for (let i = 0; i < apifyKeys.length; i++) {
        const currentIndex = (startIndex + i) % apifyKeys.length;
        const selectedToken = apifyKeys[currentIndex];
        
        console.log(`🔄 Attempt ${i + 1}/${apifyKeys.length}: Using Apify Key #${currentIndex + 1} for this run...`);
        
        const client = new ApifyClient({
            token: selectedToken
        });

        try {
            // Run the Actor and wait for it to finish
            const run = await client.actor(actorId).call(input);

            // Fetch Actor results from the run's dataset
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            console.log(`🕷️  Scraper found ${items.length} post(s)`);
            return items;

        } catch (error) {
            // If the key has exceeded its monthly limit
            if (error.statusCode === 403 && error.type === 'platform-feature-disabled') {
                console.warn(`⚠️ Apify Key #${currentIndex + 1} has exceeded its monthly limit. Rotating to next key...`);
                continue; // Move to the next key in the loop
            }
            
            // If it's some other error, throw it immediately
            console.error(`❌ Unexpected Apify Error with Key #${currentIndex + 1}:`, error.message);
            throw error;
        }
    }

    // If we've exhausted all keys
    throw new Error("❌ Fatal: All available Apify keys have exhausted their monthly limits or failed.");
}
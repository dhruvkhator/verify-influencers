import connectDB from "./src/db.js";
import Claim from "./src/models/Claim.js";
import Verification from "./src/models/Verification.js";
import { extractClaims } from "./src/utils/extractClaims.js";
import { claimVerification } from "./src/utils/verifyClaims.js";

connectDB();

extractClaims(`Vitamin D supplementation was associated with a 40% lower risk of dementia over a decade, a relatively recent study shows.

After five years, 84% of supplement users were dementia-free compared to just 68% of non-users in a study of over 12,000 people. Vitamin D reduced dementia risk by 33% in adults with mild cognitive impairment or APOE e4, a key genetic risk factor for neurodegenerative diseases.

And while vitamin D reduced dementia risk across the board, some groups benefitted more.

Women, adults with normal cognition, APOE e4 non-carriers, and those without depression saw the greatest brain-protective effects from vitamin D supplementation.

Vitamin D’s brain-protective effects may stem from its unique role as a steroid hormone, structurally akin to estrogen and cortisol. It regulates thousands of genes, many of which govern critical brain processes—an effect consistent with findings from randomized controlled trials showing improvements in cognitive function and IQ scores in older adults.

PMID: 36874594`);

//this includes the tweets fetching time and saving in db time as well and all the stuff in between.
//for 104/98 claims it took 343.238 seconds
//for 40/37 claims it took 203 seconds

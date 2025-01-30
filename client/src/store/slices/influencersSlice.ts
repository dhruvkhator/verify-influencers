import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { SERVER_HOST } from "../../utils/constants";


// Influencer type
interface Influencer {
  avatar: string | undefined;
  trust_score: number;
  verifiedClaims: Claims []
  _id: string;
  screen_name: string;
  handle: string;
  // Add other properties as needed
}

interface Claims {
  _id : string,
  claim_text: string,
  influencer_id: string,
  created_at: string,
  category: string
  verification : Verificaton[]
}

interface Verificaton {
  _id: string,
  claim_id: string,
  status: string,
  confidence: number,
  reason: string
}

interface InfluencerData{
  influencerData: Influencer | null
}

interface BasicInfluencer{
  _id: string;
  screen_name: string;
  handle: string;
  bio:string;
  trust_score: number;
  blue_verified: boolean;
  followers: number;
  avatar: string;
}



// Define the response type
interface LeaderboardResponse {
  influencers: BasicInfluencer[];
}

// State shape
interface InfluencersState {
  influencers: BasicInfluencer[]; // List of existing influencers
  loading: boolean;
  error: string | null;
  analyzing: boolean;
  jobId: string | null;
  profile: Influencer | null;
  code: string | null;
}



const initialState: InfluencersState = {
  influencers: [],
  loading: false,
  error: null,
  analyzing: false, // Only used for new influencers
  jobId: null,// Only used for new influencers
  profile: null,
  code: null
};

// Async thunk to search/add influencer
export const searchOrAddInfluencer = createAsyncThunk<
  { jobId?: string; message: string; handle?: string; code:string }, // Response type
  {influencer: string, apiKey: string, claimsCount: number}, // Input type (x_handle)
  { rejectValue: string } // Error handling type
>("influencer/search", async ({influencer, apiKey, claimsCount},  { rejectWithValue }) => {
  try {
    const response = await axios.post(`${SERVER_HOST}/api/influencer/add`, { x_handle: influencer, apiKey, claims_count: claimsCount });

    
    return response.data; // Might return { handle, message } OR { jobId, message }
  } catch (error) {
    if(error instanceof AxiosError){
      console.log(error.response?.data)
      return rejectWithValue(error.response?.data.error)
    }
    return rejectWithValue("Failed to fetch influencer.");
  }
});


export const fetchInfluencerByHandle = createAsyncThunk<InfluencerData, string, { rejectValue: string }>(
  "influencer/fetchByHandle", 
  async (handle, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${SERVER_HOST}/api/influencer/profile/${handle}`);

    //console.log(response.data)

    return response.data; // Returns the influencer object
  } catch (error) {
    if(error instanceof AxiosError){
      return rejectWithValue(error.response?.data.error)
    }
    return rejectWithValue("Failed to fetch influencer data.");
  }
});


export const fetchALlInfluencers = createAsyncThunk<LeaderboardResponse>(
  "influencer/leaderboard",
  async () =>{
    try {

      const response = await axios.get(`${SERVER_HOST}/api/influencer/all`);

      console.log(response.data);
      return response.data;
      
    } catch (error) {
      if(error instanceof AxiosError){
        return error.response?.data.error
      }
      return "Failed to fetch influencer data.";
    }
  })


const influencersSlice = createSlice({
  name: "influencers",
  initialState,
  reducers: {
    // Reset analyzing state when job completes
    resetAnalyzing: (state) => {
      state.analyzing = false;
      state.jobId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchOrAddInfluencer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOrAddInfluencer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.code=== "PROCESSING") {
          // If influencer is being analyzed
          state.analyzing = true;
          //@ts-ignore
          state.jobId = action.payload.jobId;
        }else{
          state.analyzing = false;
        }
      })
      .addCase(searchOrAddInfluencer.rejected, (state, action) => {
        state.loading = false;
        state.analyzing = false;
        state.error = action.payload || "Something went wrong.";
      })
      .addCase(fetchInfluencerByHandle.pending, (state)=>{
        state.loading = true;
      })
      .addCase(fetchInfluencerByHandle.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.influencerData;
      })
      .addCase(fetchInfluencerByHandle.rejected, (state, action)=>{
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(fetchALlInfluencers.pending, (state)=>{
        state.loading = true;
      })
      .addCase(fetchALlInfluencers.fulfilled, (state, action)=>{
        state.loading = false;
        state.influencers = action.payload.influencers;
      })
      .addCase(fetchALlInfluencers.rejected, (state, action) => {
        state.loading = false;
        //@ts-ignore
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { resetAnalyzing } = influencersSlice.actions;
export default influencersSlice.reducer;
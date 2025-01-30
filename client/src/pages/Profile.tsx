import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Award, CheckCircle, DollarSign, ExternalLink } from 'lucide-react';
import { fetchInfluencerByHandle, resetAnalyzing } from '../store/slices/influencersSlice';
import { RootState } from '../store';
import { SERVER_HOST } from '../utils/constants';


const Profile: React.FC = () => {

  const socket = useRef();

  const dispatch = useDispatch();

  //username is same as handle

  const { username } = useParams<{ username: string }>();
  const { analyzing, jobId, loading, profile } = useSelector((state: RootState) => state.influencers);


  //console.log(profile?.verifiedClaims[0].verification[0].reason)

  const verifiedClaims = profile?.verifiedClaims;


  //console.log(profileAnalyzing, analyzing)

  useEffect(() => {
    if (analyzing) {
      // Listen for WebSocket event 'analysisComplete' only when analyzing is true
      //@ts-ignore
      socket.current = io(SERVER_HOST);

      //@ts-ignore
      socket.current.on("analysisComplete", (data: { jobId: string | null; }) => {
        console.log("🔥 Analysis Complete Event Received:", data);
          dispatch(resetAnalyzing())
        
      });

      //@ts-ignore
      socket.current.on("analysisFailed", (data: any) => {
        console.log("Analysis Failed: ", data);

        //@ts-ignore
        dispatch(resetAnalyzing())
        alert(data.error)

      });

      return () => {
        //@ts-ignore
        socket.current.off("analysisComplete");
        //@ts-ignore
        socket.current.off("analysisFailed")
      };
    }
  }, [dispatch, jobId, analyzing, socket]);

  //console.log(profileAnalyzing, username, profile, loading)

  useEffect(() => {
    if (!analyzing) {
      //@ts-ignore
      dispatch(fetchInfluencerByHandle(username));
    }
  }, [dispatch, username, analyzing])


  if (analyzing) {
    return (
      <div className="p-6 text-center text-gray-400">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          <p className="ml-4">{`Analyzing @${username}'s tweets...`}</p>
        </div>
      </div>
    );
  }

  if (loading) {

    return (
      <div className="p-6 text-center text-gray-400">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          <p className="ml-4">{`Fetching @${username}'s claims...`}</p>
        </div>
      </div>
    );
  }

  if (!loading && !analyzing && !profile) {
    return (
      <div className="p-6 text-center text-gray-400">
        <div className="flex justify-center items-center text-lg font-medium">
          {`Influencer @${username} not found in our database`}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">

      <div className="bg-[#0A0B0F] rounded-lg overflow-hidden">

        <div className="p-4 sm:p-8 border-b border-gray-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <img
                src={profile?.avatar}
                alt={profile?.screen_name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-4 sm:mb-0 sm:mr-6"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{`@${profile?.handle}`}</h1>
                <div className="flex flex-col sm:flex-row items-center text-gray-400 mb-4">

                  <span className="flex items-center">
                    {profile?.screen_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-8">
          <div className="bg-[#1A1B1F] rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Trust Score</span>
              <Award className="text-emerald-500" size={20} />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-500">
              {profile?.trust_score.toPrecision(2)}%
            </div>
          </div>

          <div className="bg-[#1A1B1F] rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Followers</span> {/*Fake for now*/}
              <Users className="text-blue-500" size={20} />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              500K
            </div>
          </div>

          <div className="bg-[#1A1B1F] rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Verified Claims</span>
              <CheckCircle className="text-emerald-500" size={20} />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {verifiedClaims?.length}
            </div>
          </div>

          <div className="bg-[#1A1B1F] rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Yearly Revenue</span>
              <DollarSign className="text-yellow-500" size={20} />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">$5.0M</div>
          </div>
        </div>


        <div className="p-4 sm:p-8 border-t border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">Claims Analysis</h2>
          <div className="space-y-4">
            {verifiedClaims?.map((vC, index) => (
              <div
                key={index}
                className="bg-[#1A1B1F] rounded-lg p-6"
              >
                {/* Header with verified badge and date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="bg-emerald-500/20 text-emerald-500 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                      <CheckCircle size={14} className="mr-1" />
                      {vC.verification[0].status}
                    </span>
                    <span className="text-gray-400 text-sm">{new Date(vC.created_at).toLocaleDateString("en-GB")}</span>
                  </div>
                  <div className="text-emerald-500 font-bold">{`${vC.verification[0].confidence}/10`}</div>
                </div>

                {/* Claim title */}
                <h3 className="text-white text-lg font-medium mb-2">
                  {vC.claim_text}
                </h3>

                {/* View Source Link */}
                <p className="inline-flex items-center text-emerald-500 hover:text-emerald-400 text-sm mb-4">
                  {vC.category}
                </p>

                {/* AI Analysis */}
                <div className="mt-4">
                  <div className="flex items-center text-gray-400 mb-2">
                    <CheckCircle size={16} className="mr-2" />
                    <span className="text-sm">AI Analysis</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {vC.verification[0].reason}
                  </p>
                </div>

                {/* View Research Link */}
                <a href="#" className="inline-flex items-center text-emerald-500 hover:text-emerald-400 text-sm mt-3">
                  View Research <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  );
};

export default Profile;




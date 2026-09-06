import { useQuery } from "@tanstack/react-query";
import axiosPublic from "./axiosPublic";

const fetchReunion = async () => {
  const response = await axiosPublic.get("/reunion");

  return response.data;
};

const useReunion = () => {
  return useQuery({
    queryKey: ["reunion"],
    queryFn: fetchReunion,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export default useReunion;
import axios from "axios";

import {
  TAVILY_API_KEY,
} from "../config/tavily.js";

export const searchWeb =
  async (query) => {
    try {
      const response =
        await axios.post(
          "https://api.tavily.com/search",
          {
            api_key:
              TAVILY_API_KEY,
            query,
            search_depth:
              "advanced",
            max_results: 5,
          }
        );

      const cleanedResults =
        response.data.results.map(
          (item) => ({
            title: item.title,
            content:
              item.content,
            url: item.url,
          })
        );

      return cleanedResults;
    } catch (error) {
      console.log(
        "TAVILY ERROR:",
        error.message
      );

      return [];
    }
  };
import mongoose from "mongoose";
import { QueryBuilder } from "../../builder/QueryBuilder";
import { RecentSearch } from "./recentSearch.model";

const createRecentSearch = async (queryText: string, userId: string) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new Error("Invalid User ID!");
    }

    // if query is white space
    if (!queryText) {
        return null;
    }

    // Find the RecentSearch document for the user
    const recentSearch = await RecentSearch.findOne({ userId });

    if (recentSearch) {
        // If found, add the new search to the beginning of the searches array
        recentSearch.searches.unshift({
            searchedAt: new Date(),
            query: queryText,
        } as any);

        // Ensure the searches array only contains the latest 5 items
        if (recentSearch.searches.length > 10) {
            recentSearch.searches = recentSearch.searches.slice(0, 10);
        }

        return await recentSearch.save();
    }

    // If no RecentSearch document found, create a new one
    const newRecentSearch = new RecentSearch({
        userId,
        searches: [{ searchedAt: new Date(), query: queryText }],
    });

    return await newRecentSearch.save();
};

const getAllRecentSearchByUserId = async (userId: string) => {
    const recentSearch = await RecentSearch.findOne({ userId: userId })

    return (recentSearch as any)?.searches || [];
};

const deleteAllRecentSearch = async (userId: string) => {
    const result = await RecentSearch.deleteOne({ userId });
    return result;
}


export const recentSearchServices = {
    createRecentSearch,
    getAllRecentSearchByUserId,
    deleteAllRecentSearch,
}
import mongoose, { Schema, model } from 'mongoose';
import { IRecentSearch } from './recentSearch.interface';

const recentSearchSchema = new Schema<IRecentSearch>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  searches: [
    {
      searchedAt: { type: Date, required: true },
      query: { type: String, required: true },
    },
  ],
});

export const RecentSearch = model<IRecentSearch>('RecentSearch', recentSearchSchema);
/* eslint-disable prefer-const */
import { FilterQuery, Query } from 'mongoose';
// import { eventCreateValidationSchema } from '../modules/events/events.validation';
// import { z } from 'zod';

export class QueryBuilder<T> {
    public query: Record<string, unknown>; //payload
    public modelQuery: Query<T[], T>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
        this.query = query;
        this.modelQuery = modelQuery;
    }

      search(searchableFields: string[]) {
        let searchTerm = '';

        if (this.query?.searchTerm) {
          searchTerm = this.query.searchTerm as string;
        }


        this.modelQuery = this.modelQuery.find({
          $or: searchableFields.map(
            (field) =>
            ({
              [field]: new RegExp(searchTerm, 'i'),
            } as FilterQuery<T>)
          ),
        });

        return this;
      }



    paginate() {
        let limit: number = Number(this.query?.limit || 10);

        let skip: number = 0;

        if (this.query?.page) {
            const page: number = Number(this.query?.page || 1);
            skip = Number((page - 1) * limit);
        }

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);

        return this;
    }


  sort() {
    let sortOrder = '-createdAt'; // Default sorting: newest first

    if (this.query.sortOrder) {
      sortOrder = this.query.sortOrder === 'asc' ? 'createdAt' : '-createdAt';
    }

    this.modelQuery = this.modelQuery.sort(sortOrder);
    return this;
  }



  fields() {
        let fields = ''; // which fields want to be displayed

        if (this.query?.fields) {
            fields = (this.query?.fields as string).split(',').join(' ');
        }

        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }

  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ['searchTerm', 'page', 'limit', 'sortBy', 'sortOrder', 'fields'];

    // Remove all non-filterable fields
    excludeFields.forEach(field => delete queryObj[field]);

    if (Object.keys(queryObj).length) {
      this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    }

    return this;
  }


}
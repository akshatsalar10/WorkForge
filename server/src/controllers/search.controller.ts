import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { ApiResponse } from '../utils/apiResponse';

export class SearchController {
  static async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const results = await SearchService.globalSearch(req.params.orgId, query);

      return ApiResponse.success({
        res,
        message: 'Search completed.',
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}

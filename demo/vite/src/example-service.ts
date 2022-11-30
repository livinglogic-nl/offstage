import { service, endpoint } from 'offstage';

interface SquareRequest { nr:number }
interface SquareResponse { result:number }

export const { exampleService } = service({
  getSquare: endpoint<SquareRequest,SquareResponse>(
    'GET /foo',
    ({ nr }) => ({ result:nr*nr })
  ),
  postSquare: endpoint<SquareRequest,SquareResponse>(
    'POST /foo',
    ({ nr }) => ({ result:nr*nr })
  ),
  putSquare: endpoint<SquareRequest,SquareResponse>(
    'PUT /foo',
    ({ nr }) => ({ result:nr*nr })
  ),
  patchSquare: endpoint<SquareRequest,SquareResponse>(
    'PATCH /foo',
    ({ nr }) => ({ result:nr*nr })
  ),
  deleteSquare: endpoint<SquareRequest,SquareResponse>(
    'DELETE /foo',
    ({ nr }) => ({ result:nr*nr })
  ),
});

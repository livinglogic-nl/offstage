import { service, endpoint } from 'offstage';
import { makeUser, User } from './types.js';


interface SquareRequest { nr:number }
interface SquareResponse { result:number }

interface UserRequest { id:number }
type UserResponse = User;

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

  getUser: endpoint<UserRequest,UserResponse>(
    'GET /user/:id',
    () => makeUser(),
  ),
});

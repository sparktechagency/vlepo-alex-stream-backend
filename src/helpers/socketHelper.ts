import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import { Types } from 'mongoose';

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};

export const socketHelper = { socket };


export const sendDataWithSocket = async (
  namespace: string,
  recipient: string | Types.ObjectId,
  data: Record<string, unknown>
) => {
  //@ts-expect-error globalThis
  const socket = global.io;

  socket.emit(`${namespace}::${recipient}`, data);
};

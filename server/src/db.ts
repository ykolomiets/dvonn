import { MongoClient, Db } from 'mongodb';
import { PlayerColor } from '../../common/core/dvonn';

export interface GameInfo {
  startPosition: string;
  moves: [number, number][];
  winner: PlayerColor;
}

class DbClient {
  private db: Db | null = null;

  public connect(callback: (err: Error | null) => void): void {
    const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;

    const uri = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`;
    MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
      if (err) {
        callback(new Error('Connection failed'));
        return;
      }
      console.log('Connected to database');
      this.db = client.db('dvonn');
      callback(null);
    });
  }

  public saveGameWithAi(gameInfo: GameInfo, aiTurn: PlayerColor): void {
    if (this.db === null) {
      throw Error('Not connected to db');
    }
    this.db.collection('gamesPvE').insertOne(
      {
        ...gameInfo,
        movesCount: gameInfo.moves.length,
        aiTurn,
      },
      (err, res) => {
        if (err) {
          console.log('Saving game in db failed', err);
          return;
        }
        console.log('Game saved', res);
      }
    );
  }

  public saveGamePvP(gameInfo: GameInfo): void {
    if (this.db === null) {
      throw Error('Not connected to db');
    }
    this.db.collection('gamesPvP').insertOne(
      {
        ...gameInfo,
        movesCount: gameInfo.moves.length,
      },
      (err, res) => {
        if (err) {
          console.log('Saving game in db failed', err);
          return;
        }
        console.log('Game saved', res);
      }
    );
  }
}

export default new DbClient();

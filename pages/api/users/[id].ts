import { NextApiRequest, NextApiResponse } from 'next'
import { sampleUserData } from '../../../utils/sample-data'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query as { id: string }
    res
      .status(200)
      .json(
        Math.random() > 0.5 && Number(id) === 101
          ? { id: Math.floor(Math.random() * 100 + 200), name: 'Random' }
          : sampleUserData.find((data) => data.id === Number(id))
      )
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler

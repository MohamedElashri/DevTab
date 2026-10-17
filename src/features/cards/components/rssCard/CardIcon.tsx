import { BsRssFill } from 'src/components/Elements/Icons'

const CardIcon = ({ url }: { url?: string }) => {
  return url ? <img src={url} alt="" /> : <BsRssFill className="rss" />
}

export default CardIcon

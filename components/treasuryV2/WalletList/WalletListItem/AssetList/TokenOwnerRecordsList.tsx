import { UserGroupIcon } from '@heroicons/react/solid'
import { BN_ZERO } from '@solana/spl-governance'
import { useMemo } from 'react'
import Collapsible from './Collapsible'
import TokenOwnerRecordListItem from './TokenOwnerRecordListItem'
import { PublicKey } from '@solana/web3.js'
import { useAsync } from 'react-async-hook'
import { useConnection } from '@solana/wallet-adapter-react'
import { fetchTokenOwnerRecordsByOwnerAnyRealm } from '@hooks/queries/tokenOwnerRecord'

interface Props {
  className?: string
  disableCollapse?: boolean
  expanded?: boolean
  onToggleExpand?(): void
  governance: PublicKey
}
export default function TokenOwnerRecordsList({ governance, ...props }: Props) {
  const { connection } = useConnection()

  const { result: tors } = useAsync(
    // TODO get same for the native treasuries !
    async () => fetchTokenOwnerRecordsByOwnerAnyRealm(connection, governance),
    [connection, governance]
  )

  const validTokenOwnerRecords = useMemo(() => {
    return tors?.filter((a) =>
      a.account.governingTokenDepositAmount.gt(BN_ZERO)
    )
  }, [tors])

  if (!validTokenOwnerRecords?.length) return null

  return (
    <Collapsible
      className={props.className}
      count={validTokenOwnerRecords.length}
      disableCollapse={props.disableCollapse}
      expanded={props.expanded}
      icon={<UserGroupIcon className="stroke-white/50" />}
      title="DAO Memberships"
      onToggleExpand={props.onToggleExpand}
    >
      {validTokenOwnerRecords.map((a) => (
        <TokenOwnerRecordListItem
          key={a.pubkey.toBase58()}
          pubkey={a.pubkey}
          governance={governance}
        />
      ))}
    </Collapsible>
  )
}

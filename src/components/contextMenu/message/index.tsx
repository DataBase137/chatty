import { useOnClickOutside } from "@/hooks/useOnClickOutside"
import { FC, useRef } from "react"
import { FaUndo } from "react-icons/fa"
import { FaPen } from "react-icons/fa6"

interface MessageContextMenuProps {
  x: number
  y: number
  closeContextMenu: () => void
}

const MessageContextMenu: FC<MessageContextMenuProps> = ({
  x,
  y,
  closeContextMenu,
}) => {
  const contextMenuRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(contextMenuRef, closeContextMenu)

  return (
    <div
      ref={contextMenuRef}
      className="absolute z-20 box-border flex w-fit flex-col gap-0.5 rounded-[0.85rem] bg-slate-100 px-2 py-2 shadow-lg"
      style={{
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      <button className="flex items-center gap-2 text-nowrap rounded-lg px-2.5 py-1.5 hover:bg-slate-300 hover:bg-opacity-40">
        <FaPen className="text-[0.75rem]" />
        <p className="text-sm">edit message</p>
      </button>
      <button
        className="flex items-center gap-2 text-nowrap rounded-lg px-2.5 py-1.5 hover:bg-slate-300 hover:bg-opacity-40"
        type="submit"
      >
        <FaUndo className="text-[0.75rem]" />
        <p className="text-sm">unsend</p>
      </button>
    </div>
  )
}

export default MessageContextMenu

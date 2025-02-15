import { useEffect } from 'react'

type UseHandleOutsideClick = {
  ref: React.RefObject<HTMLElement>;
  onOutsideClick: () => void;
};

export const useHandleOutsideClick = ({
  ref,
  onOutsideClick,
}: UseHandleOutsideClick) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })
}

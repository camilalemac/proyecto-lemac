type Props = {
  titulo: string
  valor: number
}

export default function ResumenCard({ titulo, valor }: Props) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        borderRadius: "10px",
        minWidth: "120px",
      }}
    >
      <h3>{titulo}</h3>
      <p>${valor}</p>
    </div>
  )
}
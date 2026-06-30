import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const ClientsChart = ({ SelectedYear }: { SelectedYear: number }) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Ventas por cliente</CardTitle>
        <CardDescription>{SelectedYear}</CardDescription>
      </CardHeader>
    </Card>
  )
}
export default ClientsChart
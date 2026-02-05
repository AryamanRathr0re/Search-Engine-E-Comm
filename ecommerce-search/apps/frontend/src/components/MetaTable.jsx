export default function MetaTable({ rows }) {
  const data = Array.isArray(rows) ? rows.filter((r) => r && r.value) : [];
  if (!data.length) return null;
  return (
    <table className="meta-table">
      <tbody>
        {data.map((r, i) => (
          <tr key={i}>
            <td className="label">{r.label}</td>
            <td className="value">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid hsla(228, 20%, 30%, 0.3)',
          borderTopColor: 'hsl(225, 82%, 52%)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  );
}

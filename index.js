const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================================
// WEBHOOK DA FORTPAY
// Configure essa URL no painel FortPay > Produto > Postback
// URL: https://SEU-APP.onrender.com/webhook/fortpay
// =========================================================
app.post("/webhook/fortpay", (req, res) => {
  const payload = req.body;

  console.log("📦 Webhook recebido:", JSON.stringify(payload, null, 2));

  // FortPay envia o status da venda no campo "status" ou "sale_status"
  // Valores comuns: "paid", "approved", "completed", "canceled", "refunded"
  const status = (payload.status || payload.sale_status || "").toLowerCase();

  if (status === "paid" || status === "approved" || status === "completed") {
    const cliente = {
      nome: payload.customer_name || payload.name || "Cliente",
      email: payload.customer_email || payload.email || "",
      valor: payload.amount || payload.value || "24.90",
      transacao: payload.transaction_id || payload.order_id || payload.id || "N/A",
      data: new Date().toLocaleString("pt-BR"),
    };

    console.log(`✅ VENDA APROVADA!`);
    console.log(`   Nome: ${cliente.nome}`);
    console.log(`   Email: ${cliente.email}`);
    console.log(`   Valor: R$ ${cliente.valor}`);
    console.log(`   Transação: ${cliente.transacao}`);

    // Aqui você pode adicionar futuramente:
    // - Envio de email com o link do produto
    // - Salvar em banco de dados
    // - Notificação no Telegram/WhatsApp
  } else {
    console.log(`⏳ Status recebido: ${status} — aguardando aprovação.`);
  }

  // FortPay exige resposta 200 para confirmar recebimento
  res.status(200).json({ received: true });
});

// =========================================================
// ROTA DE SAÚDE (Render usa isso para manter o app vivo)
// =========================================================
app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "50 Petiscos Gourmet Para Lucrar — Backend",
    webhook_url: "/webhook/fortpay",
  });
});

// =========================================================
// INICIAR SERVIDOR
// =========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

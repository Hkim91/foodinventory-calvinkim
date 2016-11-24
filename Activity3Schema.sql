USE FoodInventory
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Sales]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Sales](
	[ID] [int] PRIMARY KEY IDENTITY(1,1) UNIQUE NOT NULL,
	[SaleDate] [datetime] NOT NULL,
	[ProductName] [varchar](50) NOT NULL,
	[QuantityBought] [int] NOT NULL,
	[Discount] [decimal](18, 2) NOT NULL,
	[PaymentType] [varchar](20) NOT NULL
)
END
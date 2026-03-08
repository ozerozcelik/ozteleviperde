import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// ============================================
// Admin Dashboard Stats API
// GET /api/admin/stats - Dashboard istatistikleri
// ============================================

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    // Test database connection first
    try {
      await db.$connect()
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            products: { total: 0, inStock: 0, outOfStock: 0 },
            orders: { total: 0, pending: 0, completed: 0 },
            revenue: { total: 0, monthly: 0, daily: 0, growth: 0 },
            users: { total: 0, newThisMonth: 0 },
            messages: { total: 0, new: 0 },
            quotes: { total: 0, pending: 0 },
            newsletter: 0,
          },
          lowStockProducts: [],
          recentOrders: [],
          topProducts: [],
          charts: {
            revenueByDay: [],
            ordersByStatus: [],
            productsByCategory: [],
          },
        },
      })
    }

    // Tarih hesaplamaları
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    // Parallel queries for better performance
    const [
      totalProducts,
      productsInStock,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      dailyRevenue,
      totalUsers,
      newUsersThisMonth,
      totalContacts,
      newContacts,
      totalQuotes,
      pendingQuotes,
      newsletterSubscribers,
      recentOrders,
      topProducts,
      productsByCategory,
    ] = await Promise.all([
      // Toplam ürün
      db.product.count(),
      
      // Stokta olan ürünler
      db.product.count({ where: { inStock: true } }),
      
      // Düşük stoklu ürünler (10 adetten az)
      db.product.findMany({
        where: { 
          OR: [
            { stock: { lt: 10, gt: 0 } },
            { stock: 0 },
          ]
        },
        select: { id: true, name: true, stock: true, category: true, image: true },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
      
      // Toplam sipariş
      db.order.count(),
      
      // Bekleyen siparişler
      db.order.count({ where: { status: 'pending' } }),
      
      // Tamamlanan siparişler
      db.order.count({ where: { status: 'delivered' } }),
      
      // Toplam gelir (tamamlanan siparişler)
      db.order.aggregate({
        where: { status: 'delivered' },
        _sum: { total: true },
      }),
      
      // Bu ayki gelir
      db.order.aggregate({
        where: {
          createdAt: { gte: thisMonthStart },
          status: { not: 'cancelled' },
        },
        _sum: { total: true },
      }),
      
      // Geçen ayki gelir
      db.order.aggregate({
        where: {
          createdAt: { gte: lastMonthStart, lt: thisMonthStart },
          status: { not: 'cancelled' },
        },
        _sum: { total: true },
      }),
      
      // Bugünkü gelir
      db.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: { not: 'cancelled' },
        },
        _sum: { total: true },
      }),
      
      // Toplam kullanıcı
      db.user.count(),
      
      // Bu ay yeni kullanıcılar
      db.user.count({
        where: { createdAt: { gte: thisMonthStart } },
      }),
      
      // Toplam iletişim mesajı
      db.contact.count(),
      
      // Yeni mesajlar
      db.contact.count({ where: { status: 'new' } }),
      
      // Toplam teklif talebi
      db.quoteRequest.count(),
      
      // Bekleyen teklifler
      db.quoteRequest.count({ where: { status: 'new' } }),
      
      // Bülten aboneleri
      db.newsletter.count({ where: { active: true } }),
      
      // Son siparişler
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            select: {
              productName: true,
              quantity: true,
              price: true,
            },
          },
        },
      }),
      
      // En çok satan ürünler
      db.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      
      // Kategorilere göre ürün dağılımı
      db.product.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
    ])
    
    // Sipariş durumlarına göre dağılım
    const ordersByStatus = await db.order.groupBy({
      by: ['status'],
      _count: { id: true },
    })
    
    // Son 7 günlük sipariş ve gelir (manuel hesaplama)
    const last7DaysOrders = await db.order.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        },
        status: { not: 'cancelled' },
      },
      select: {
        createdAt: true,
        total: true,
      },
    })
    
    // Günlere göre grupla
    const revenueByDay: { date: string; revenue: number; orders: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayOrders = last7DaysOrders.filter(o => 
        o.createdAt.toISOString().split('T')[0] === dateStr
      )
      revenueByDay.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        orders: dayOrders.length,
      })
    }
    
    // Hesaplamalar
    const totalRevenueValue = totalRevenue._sum.total || 0
    const monthlyRevenueValue = monthlyRevenue._sum.total || 0
    const lastMonthRevenueValue = lastMonthRevenue._sum.total || 0
    const dailyRevenueValue = dailyRevenue._sum.total || 0
    
    // Büyüme oranları
    const revenueGrowth = lastMonthRevenueValue > 0 
      ? ((monthlyRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100 
      : 0
    
    // Özet kartlar için veri
    const summaryCards = {
      products: {
        total: totalProducts,
        inStock: productsInStock,
        outOfStock: totalProducts - productsInStock,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
      },
      revenue: {
        total: totalRevenueValue,
        monthly: monthlyRevenueValue,
        daily: dailyRevenueValue,
        growth: revenueGrowth,
      },
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      messages: {
        total: totalContacts,
        new: newContacts,
      },
      quotes: {
        total: totalQuotes,
        pending: pendingQuotes,
      },
      newsletter: newsletterSubscribers,
    }
    
    return NextResponse.json({
      success: true,
      data: {
        summary: summaryCards,
        lowStockProducts,
        recentOrders,
        topProducts: topProducts.map(p => ({
          productId: p.productId,
          name: p.productName,
          totalSold: p._sum.quantity,
        })),
        charts: {
          revenueByDay,
          ordersByStatus: ordersByStatus.map(s => ({
            status: s.status,
            count: s._count.id,
          })),
          productsByCategory: productsByCategory.map(c => ({
            category: c.category,
            count: c._count.id,
          })),
        },
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'İstatistikler yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
